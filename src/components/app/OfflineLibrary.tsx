/**
 * Step 7: Offline Library
 *
 * Downloads file materials for offline use using:
 *  - Web Crypto API (AES-GCM) to encrypt blobs before storing
 *  - IndexedDB (via a simple wrapper) to persist encrypted blobs
 *  - A "Download for Offline" button on each material card
 *
 * The service worker (public/sw.js) intercepts /api/materials/serve/* and
 * serves from the IndexedDB cache when offline.
 *
 * Note: The encryption key is derived from the user's session token so that
 * blobs are tied to the user's session and cannot be read by other users on
 * the same device.
 */
import { useState, useEffect, useCallback } from 'react';
import { Download, Trash2, WifiOff, CheckCircle, Loader2 } from 'lucide-react';

const DB_NAME = 'atrc_offline';
const STORE_NAME = 'materials';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deriveKey(sessionToken: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(sessionToken), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('atrc_offline_v1'), iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function encryptBlob(blob: Blob, key: CryptoKey): Promise<{ iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, await blob.arrayBuffer());
  return { iv, data };
}

async function decryptBlob(iv: Uint8Array<ArrayBuffer>, data: ArrayBuffer, key: CryptoKey, mimeType: string): Promise<Blob> {
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new Blob([decrypted], { type: mimeType });
}

export interface OfflineMaterial {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  savedAt: number;
}

async function listOffline(): Promise<OfflineMaterial[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve((req.result as Array<{ id: string; name: string; mimeType: string; size: number; savedAt: number }>).map(r => ({ id: r.id, name: r.name, mimeType: r.mimeType, size: r.size, savedAt: r.savedAt })));
    req.onerror = () => reject(req.error);
  });
}

async function removeOffline(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('atrc_session_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatBytes(b: number) {
  if (b === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// ── Hook: manage offline state for a single material ─────────────────────────
export function useOfflineMaterial(materialId: string) {
  const [isOffline, setIsOffline] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    listOffline().then(list => setIsOffline(list.some(m => m.id === materialId))).catch(() => {});
  }, [materialId]);

  const download = useCallback(async (serveUrl: string, name: string, mimeType: string, size: number) => {
    const sessionToken = localStorage.getItem('atrc_session_token') ?? '';
    if (!sessionToken) return;
    setDownloading(true);
    try {
      const res = await fetch(serveUrl, { headers: authHeader() });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const key = await deriveKey(sessionToken);
      const { iv, data } = await encryptBlob(blob, key);
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put({ id: materialId, name, mimeType, size, savedAt: Date.now(), iv, data });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      setIsOffline(true);
    } catch {
      alert('Failed to save for offline. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [materialId]);

  const remove = useCallback(async () => {
    await removeOffline(materialId);
    setIsOffline(false);
  }, [materialId]);

  return { isOffline, downloading, download, remove };
}

// ── Offline Library Tab ───────────────────────────────────────────────────────
export default function OfflineLibrary() {
  const [items, setItems] = useState<OfflineMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    listOffline()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = async (item: OfflineMaterial) => {
    const sessionToken = localStorage.getItem('atrc_session_token') ?? '';
    if (!sessionToken) return;
    setOpeningId(item.id);
    try {
      const db = await openDb();
      const record = await new Promise<{ iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer; mimeType: string }>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).get(item.id);
        req.onsuccess = () => resolve(req.result as { iv: Uint8Array<ArrayBuffer>; data: ArrayBuffer; mimeType: string });
        req.onerror = () => reject(req.error);
      });
      const key = await deriveKey(sessionToken);
      const blob = await decryptBlob(record.iv, record.data, key, record.mimeType);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch {
      alert('Failed to open offline file. The file may be corrupted or your session has changed.');
    } finally {
      setOpeningId(null);
    }
  };

  const handleRemove = async (id: string) => {
    await removeOffline(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  if (loading) return (
    <div className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
      <p className="text-sm">Loading offline library…</p>
    </div>
  );

  if (items.length === 0) return (
    <div className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
      <WifiOff size={32} className="mx-auto mb-2 opacity-40" />
      <p className="text-sm font-bold">No offline materials saved</p>
      <p className="text-xs mt-1">Use the ↓ button on any file material to save it for offline access.</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 rounded" style={{ border: '2px solid hsl(var(--color-divider-cream))' }}>
          <CheckCircle size={16} style={{ color: 'hsl(var(--color-gold))', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: 'hsl(var(--color-body-text))' }}>{item.name}</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>
              {formatBytes(item.size)} · Saved {new Date(item.savedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleOpen(item)}
              disabled={openingId === item.id}
              className="px-2 py-1 text-[10px] font-bold uppercase rounded disabled:opacity-50"
              style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))' }}
            >
              {openingId === item.id ? <Loader2 size={10} className="animate-spin" /> : 'Open'}
            </button>
            <button
              onClick={() => handleRemove(item.id)}
              className="p-1.5 rounded"
              style={{ color: 'hsl(var(--color-danger))' }}
              title="Remove from offline"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Download for Offline button ───────────────────────────────────────────────
export function OfflineDownloadButton({ materialId, serveUrl, name, mimeType, size }: {
  materialId: string;
  serveUrl: string;
  name: string;
  mimeType: string;
  size: number;
}) {
  const { isOffline, downloading, download, remove } = useOfflineMaterial(materialId);

  if (isOffline) return (
    <button
      onClick={remove}
      title="Remove from offline"
      className="p-1.5 rounded"
      style={{ color: 'hsl(var(--color-gold))' }}
    >
      <CheckCircle size={13} />
    </button>
  );

  return (
    <button
      onClick={() => download(serveUrl, name, mimeType, size)}
      disabled={downloading}
      title="Save for offline"
      className="p-1.5 rounded disabled:opacity-50"
      style={{ color: 'hsl(var(--color-body-muted))' }}
    >
      {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
    </button>
  );
}

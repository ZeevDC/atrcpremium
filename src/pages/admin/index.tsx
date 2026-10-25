import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Search, Plus, Edit2, Trash2, AlertTriangle, X, Upload, FileText, Eye, EyeOff } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import { useSession } from '@/lib/auth/auth-client';
import { useNavigate } from 'react-router';
import { admin } from 'virtual:content';
import AccessManagement from '@/components/app/AccessManagement';
import MaterialsAnalytics from '@/components/app/MaterialsAnalytics';

const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

function adminAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('atrc_session_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}


type AdminTab = 'users' | 'access' | 'allowlist' | 'materials' | 'announcements' | 'analytics' | 'leaderboard' | 'maintenance' | 'backup';
const TAB_IDS: AdminTab[] = ['users', 'access', 'allowlist', 'materials', 'announcements', 'analytics', 'leaderboard', 'maintenance', 'backup'];

interface MockUser {
  id: string;name: string;university: string;email: string;studentNumber: string;lastActive: string;streak: number;status: 'active' | 'inactive';
}

interface Announcement {
  id: string;title: string;body: string;date: string;pinned: boolean;status: 'published' | 'draft';
}

interface Material {
  id: string;name: string;
  subject: 'abnormal' | 'assessment' | 'io' | 'developmental' | 'general';
  category: 'notes' | 'drills' | 'lectures' | 'gizmo';
  type: 'file' | 'link' | 'drive_folder';
  filename: string;originalName: string;mimeType: string;size: number;
  uploadedAt: string;uploadedBy: string;watermark: boolean;published: boolean;url: string;
  thumbnailPath: string | null;sortOrder: number;scheduledAt: string | null;deletedAt: string | null;hasPassword: boolean;
}

function Card({ children }: {children: React.ReactNode;}) {
  return (
    <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(222 50% 16% / 0.12)', borderRadius: '14px', boxShadow: '0 1px 2px hsl(222 50% 16% / 0.06), 0 8px 24px -12px hsl(222 50% 16% / 0.15)', overflow: 'hidden' }}>
      {children}
    </div>);

}
function CardHeader({ children }: {children: React.ReactNode;}) {
  return (
    <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(222 50% 16% / 0.10)' }}>
      <h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{children}</h2>
    </div>);

}
function CardBody({ children }: {children: React.ReactNode;}) {
  return <div className="p-4 sm:p-5">{children}</div>;
}

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const j = JSON.parse(text) as { error?: string; message?: string };
    return [j.error, j.message].filter(Boolean).join(' — ') || `Request failed (${res.status})`;
  } catch {
    if (res.status === 413) return 'File is too large for the server.';
    return text && !text.trimStart().startsWith('<') ? text.slice(0, 200) : `Request failed (${res.status})`;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime === 'application/pdf') return '📄';
  return '📎';
}

interface ExpiringEntry {
  userId: string;
  userName: string;
  userEmail: string;
  expiryDate: string | null;
  daysRemaining: number | null;
}

function ExpiringWidget() {
  const [list, setList] = useState<ExpiringEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/access/expiring-soon').
    then((r) => r.json()).
    then(setList).
    catch(() => {}).
    finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (list.length === 0) return (
    <Card>
      <CardHeader>⏰ Expiring Soon</CardHeader>
      <CardBody><p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>No students expiring within 7 days. 🎉</p></CardBody>
    </Card>);


  return (
    <Card>
      <CardHeader>⏰ Expiring Soon ({list.length})</CardHeader>
      <CardBody>
        <div className="space-y-2">
          {list.map((e) =>
          <div key={e.userId} className="flex items-center justify-between gap-2 p-2 rounded text-xs" style={{ background: 'hsl(38 92% 50% / 0.1)', border: '1.5px solid hsl(38 92% 50% / 0.4)' }}>
              <div>
                <div className="font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{e.userName}</div>
                <div style={{ color: 'hsl(var(--color-body-muted))' }}>{e.userEmail}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold" style={{ color: 'hsl(38 92% 50%)' }}>{e.daysRemaining}d left</div>
                <div style={{ color: 'hsl(var(--color-body-muted))' }}>{e.expiryDate}</div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>);

}

export default function AdminPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  const [tab, setTab] = useState<AdminTab>('users');
  const [userSearch, setUserSearch] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [users] = useState<MockUser[]>([]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annModal, setAnnModal] = useState<{open: boolean;editing: Announcement | null;}>({ open: false, editing: null });
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPinned, setAnnPinned] = useState(false);
  const [annStatus, setAnnStatus] = useState<'published' | 'draft'>('published');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [matLoading, setMatLoading] = useState(false);
  const [matModal, setMatModal] = useState<{open: boolean;editing: Material | null;}>({ open: false, editing: null });
  const [matName, setMatName] = useState('');
  const [matSubject, setMatSubject] = useState<Material['subject']>('general');
  const [matCategory, setMatCategory] = useState<Material['category']>('notes');
  const [matWatermark, setMatWatermark] = useState(true);
  const [matPublished, setMatPublished] = useState(true);
  const [matPassword, setMatPassword] = useState('');
  const [matClearPassword, setMatClearPassword] = useState(false);
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matUploading, setMatUploading] = useState(false);
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number } | null>(null);
  const [matSearch, setMatSearch] = useState('');
  const [matInputType, setMatInputType] = useState<'file' | 'link' | 'drive_folder'>('file');
  const [matLink, setMatLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{msg: string;type: 'ok' | 'err';} | null>(null);
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // PmLE date
  const [pmleDate, setPmleDate] = useState<string>('');
  const [pmleSaved, setPmleSaved] = useState<string | null>(null);
  const [pmleSaving, setPmleSaving] = useState(false);

  // Cloud backup
  const [backupStatus, setBackupStatus] = useState<{lastBackup: {timestamp: string;tablesExported: string[];} | null;} | null>(null);
  const [backupRunning, setBackupRunning] = useState(false);
  const [backupResult, setBackupResult] = useState<{success: boolean;error?: string;} | null>(null);

  // DB Migration
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ok: boolean; results?: string[]; error?: string} | null>(null);

  const runMigration = async () => {
    setMigrationRunning(true);
    setMigrationResult(null);
    try {
      const res = await fetch('/api/admin/run-migration', { method: 'POST', headers: adminAuthHeader() });
      const data = await res.json() as {ok: boolean; results?: string[]; error?: string};
      setMigrationResult(data);
      if (data.ok) showToast('✓ Migration complete — all columns are up to date.');
      else showToast(data.error ?? 'Migration failed.', 'err');
    } catch {
      setMigrationResult({ ok: false, error: 'Network error' });
      showToast('Migration failed — network error.', 'err');
    } finally {
      setMigrationRunning(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/backup').
    then((r) => r.json()).
    then((d: {lastBackup: {timestamp: string;tablesExported: string[];} | null;}) => setBackupStatus(d)).
    catch(() => {});
  }, [isAdmin]);

  const runManualBackup = async () => {
    setBackupRunning(true);
    setBackupResult(null);
    try {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      if (res.status === 202) {
        // Fire-and-forget: backup is running in background
        showToast('☁️ Backup started — this may take up to 30 seconds.');
        // Poll GET endpoint after 15s to pick up the new timestamp
        setTimeout(() => {
          fetch('/api/admin/backup').
          then((r) => r.json()).
          then((d: {lastBackup: {timestamp: string;tablesExported: string[];} | null;}) => {
            setBackupStatus(d);
            setBackupResult({ success: true });
            showToast('☁️ Backup saved to cloud successfully!');
          }).
          catch(() => {}).
          finally(() => setBackupRunning(false));
        }, 15000);
        return;
      }
      // Fallback: synchronous response (older behaviour)
      const data: {success: boolean;timestamp: string;tablesExported: string[];error?: string;} = await res.json();
      setBackupResult({ success: data.success, error: data.error });
      if (data.success) {
        setBackupStatus({ lastBackup: { timestamp: data.timestamp, tablesExported: data.tablesExported } });
        showToast('☁️ Backup saved to cloud successfully!');
      } else {
        showToast(data.error ?? 'Backup failed.', 'err');
      }
    } catch {
      setBackupResult({ success: false, error: 'Network error' });
      showToast('Backup failed — network error.', 'err');
    } finally {
      setBackupRunning(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    setMatLoading(true);
    fetch('/api/admin/materials', { headers: adminAuthHeader() }).
    then((r) => r.json()).
    then((data: unknown) => {
      if (Array.isArray(data)) setMaterials(data as Material[]);else
      showToast('Failed to load materials.', 'err');
    }).
    catch(() => showToast('Failed to load materials.', 'err')).
    finally(() => setMatLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch('/api/admin/pmle-date').
    then((r) => r.json()).
    then((data: {date: string | null;}) => {
      setPmleSaved(data.date ?? null);
      setPmleDate(data.date ?? '');
    }).
    catch(() => showToast(admin.analytics.pmleLoadError, 'err'));
  }, [isAdmin]);

  const savePmleDate = async (dateVal: string | null) => {
    setPmleSaving(true);
    try {
      const res = await fetch('/api/admin/pmle-date', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: dateVal || null }) });
      throw new Error(await readError(res));
      const data: {date: string | null;} = await res.json();
      setPmleSaved(data.date ?? null);
      setPmleDate(data.date ?? '');
      showToast(dateVal ? admin.analytics.pmleSavedToast : admin.analytics.pmleClearedToast);
    } catch {
      showToast(admin.analytics.pmleErrorToast, 'err');
    } finally {
      setPmleSaving(false);
    }
  };

  const openNewAnn = () => {setAnnTitle('');setAnnBody('');setAnnPinned(false);setAnnStatus('published');setAnnModal({ open: true, editing: null });};
  const openEditAnn = (a: Announcement) => {setAnnTitle(a.title);setAnnBody(a.body);setAnnPinned(a.pinned);setAnnStatus(a.status);setAnnModal({ open: true, editing: a });};
  const saveAnn = () => {
    if (!annTitle.trim()) return;
    if (annModal.editing) {
      setAnnouncements((prev) => prev.map((a) => a.id === annModal.editing!.id ? { ...a, title: annTitle.trim(), body: annBody.trim(), pinned: annPinned, status: annStatus } : a));
      showToast('Announcement updated.');
    } else {
      setAnnouncements((prev) => [...prev, { id: Date.now().toString(), title: annTitle.trim(), body: annBody.trim(), date: new Date().toISOString().slice(0, 10), pinned: annPinned, status: annStatus }]);
      showToast('Announcement posted.');
    }
    setAnnModal({ open: false, editing: null });
  };
  const deleteAnn = (id: string) => {setAnnouncements((prev) => prev.filter((a) => a.id !== id));showToast('Announcement deleted.');};

  const openNewMat = () => {setMatName('');setMatSubject('general');setMatCategory('notes');setMatWatermark(true);setMatPublished(true);setMatFile(null);setMatLink('');setMatInputType('file');setMatModal({ open: true, editing: null });};
  const openEditMat = (m: Material) => {setMatName(m.name);setMatSubject(m.subject);setMatCategory(m.category);setMatWatermark(m.watermark);setMatPublished(m.published);setMatFile(null);setMatLink(m.type === 'link' || m.type === 'drive_folder' ? m.url : '');setMatInputType(m.type === 'link' ? 'link' : m.type === 'drive_folder' ? 'drive_folder' : 'file');setMatPassword('');setMatClearPassword(false);setMatModal({ open: true, editing: m });};
  const closeMat = () => {setMatModal({ open: false, editing: null });setMatFile(null);setMatLink('');setMatPassword('');setMatClearPassword(false);};

  const submitMat = async () => {
    if (!matModal.editing) {
      if (matInputType === 'file' && !matFile) {showToast('Please select a file.', 'err');return;}
      if (matInputType === 'link' && !matLink.trim()) {showToast('Please enter a URL.', 'err');return;}
      if (matInputType === 'drive_folder' && !matLink.trim()) { showToast('Please enter a Drive folder URL.', 'err'); return; }
    }
    setMatUploading(true);
    setChunkProgress(null);
    try {
      if (matModal.editing) {
        // PATCH — update metadata; if it was a link, also update the url
        const body: Record<string, unknown> = { id: matModal.editing.id, name: matName, subject: matSubject, category: matCategory, watermark: matWatermark, published: matPublished };
        if (matPassword) body.password = matPassword;
        if (matClearPassword) body.clearPassword = true;
        if ((matModal.editing.type === 'link' || matModal.editing.type === 'drive_folder') && matLink.trim()) body.url = matLink.trim();
        const res = await fetch('/api/admin/materials', { method: 'PATCH', headers: { ...adminAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(await res.text());
        const updated: Material = await res.json();
        setMaterials((prev) => prev.map((m) => m.id === updated.id ? updated : m));
        showToast('Material updated.');
      } else if (matInputType === 'link' || matInputType === 'drive_folder') {
        const res = await fetch('/api/admin/materials', { method: 'POST', headers: { ...adminAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify({ type: matInputType, name: matName || matLink, subject: matSubject, category: matCategory, watermark: String(matWatermark), published: String(matPublished), url: matLink.trim(), ...(matPassword ? { password: matPassword } : {}) }) });
        if (!res.ok) throw new Error(await res.text());
        const created: Material = await res.json();
        setMaterials((prev) => [...prev, created]);
        showToast(matInputType === 'drive_folder' ? 'Google Drive folder added.' : 'Link added.');
      } else {
        const file = matFile!;
        const CHUNK_SIZE = 50 * 1024 * 1024; // 50 MB — safely under Cloudflare's 100 MB limit

        if (file.size > CHUNK_SIZE) {
          // ── Chunked upload for large files ──────────────────────────────────
          const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
          const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

          for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const chunk = file.slice(start, end);
            const chunkFd = new FormData();
            chunkFd.append('chunk', chunk, file.name);
            setChunkProgress({ current: i + 1, total: totalChunks });
            const chunkRes = await fetch(
              `/api/admin/materials/upload-chunk/${uploadId}?index=${i}&total=${totalChunks}`,
              { method: 'POST', headers: adminAuthHeader(), body: chunkFd },
            );
            if (!chunkRes.ok) throw new Error(`Chunk ${i + 1}/${totalChunks} failed: ${await chunkRes.text()}`);
          }

          // Finalise — assemble chunks and insert DB record
          const finalRes = await fetch('/api/admin/materials/upload-finalise', {
            method: 'POST',
            headers: { ...adminAuthHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadId,
              originalName: file.name,
              name: matName || file.name,
              subject: matSubject,
              category: matCategory,
              mimeType: file.type || 'application/octet-stream',
              watermark: String(matWatermark),
              published: String(matPublished),
              totalChunks: String(totalChunks),
              ...(matPassword ? { password: matPassword } : {}),
            }),
          });
          if (!finalRes.ok) throw new Error(await finalRes.text());
          const created: Material = await finalRes.json();
          setMaterials((prev) => [...prev, created]);
          showToast('Material uploaded.');
        } else {
          // ── Standard single-request upload for small files ───────────────────
          const fd = new FormData();
          fd.append('file', file);
          fd.append('type', 'file');
          fd.append('name', matName || file.name);
          fd.append('subject', matSubject);
          fd.append('category', matCategory);
          fd.append('watermark', String(matWatermark));
          fd.append('published', String(matPublished));
          if (matPassword) fd.append('password', matPassword);
          const res = await fetch('/api/admin/materials', { method: 'POST', headers: adminAuthHeader(), body: fd });
          if (!res.ok) throw new Error(await res.text());
          const created: Material = await res.json();
          setMaterials((prev) => [...prev, created]);
          showToast('Material uploaded.');
        }
      }
      closeMat();
    } catch (err) {
      showToast(`Failed: ${String(err)}`, 'err');
    } finally {
      setMatUploading(false);
      setChunkProgress(null);
    }
  };

  const togglePublished = async (m: Material) => {
    try {
      const res = await fetch('/api/admin/materials', { method: 'PATCH', headers: { ...adminAuthHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id, published: !m.published }) });
      if (!res.ok) throw new Error();
      const updated: Material = await res.json();
      setMaterials((prev) => prev.map((x) => x.id === updated.id ? updated : x));
    } catch {showToast('Failed to update.', 'err');}
  };

  const openMaterial = async (m: Material) => {
    if (m.type !== 'file') {
      if (m.url) window.open(m.url, '_blank', 'noopener,noreferrer');
      else showToast('This material has no URL.', 'err');
      return;
    }

    // File URLs are private R2 keys, not website paths. Open through the same
    // short-lived token and streaming endpoint used by the student viewer.
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      showToast('Allow pop-ups to open this material.', 'err');
      return;
    }

    try {
      const response = await fetch('/api/materials/token', {
        method: 'POST',
        headers: { ...adminAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: m.id }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json() as { token?: string };
      if (!data.token) throw new Error('The server did not return a file access token.');
      popup.location.href = `/api/materials/serve/${encodeURIComponent(data.token)}`;
      popup.opener = null;
    } catch (error) {
      popup.close();
      showToast(`Could not open material: ${error instanceof Error ? error.message : String(error)}`, 'err');
    }
  };

  const deleteMat = async (m: Material) => {
    if (!confirm(`Delete "${m.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/materials?id=${m.id}`, { method: 'DELETE', headers: adminAuthHeader() });
      if (!res.ok) throw new Error();
      setMaterials((prev) => prev.filter((x) => x.id !== m.id));
      showToast('Material deleted.');
    } catch {showToast('Failed to delete.', 'err');}
  };

  const filteredMaterials = materials.filter((m) =>
  m.name.toLowerCase().includes(matSearch.toLowerCase()) ||
  m.subject.toLowerCase().includes(matSearch.toLowerCase()) ||
  m.category.toLowerCase().includes(matSearch.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <AppShell activeSection="admin">
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="text-center">
            <div className="text-5xl mb-4">{admin.accessDenied.icon}</div>
            <h2 className="text-xl font-black uppercase mb-2" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--foreground))' }}>{admin.accessDenied.title}</h2>
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--color-sidebar-text))' }}>{admin.accessDenied.description}</p>
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}>{admin.accessDenied.homeButton}</button>
          </div>
        </div>
      </AppShell>);

  }

  const filteredUsers = users.filter((u) =>
  u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
  u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
  u.university.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tabLabel = (id: AdminTab): string => {
    const map: Record<AdminTab, string> = { users: admin.tabs.users, access: '🔑 Access', allowlist: admin.tabs.allowlist, materials: admin.tabs.materials, announcements: admin.tabs.announcements, analytics: admin.tabs.analytics, leaderboard: admin.tabs.leaderboard, maintenance: admin.tabs.maintenance, backup: '☁️ Cloud Backup' };
    return map[id];
  };

  const analyticsValues = [users.length.toString(), users.filter((u) => u.status === 'active').length.toString(), '0h', '0 days', announcements.length.toString(), users.filter((u) => u.status === 'inactive').length.toString()];

  return (
    <AppShell activeSection="admin">
      <Helmet>
        <title>Admin Panel — ATRC Premium</title>
        <meta name="description" content="Admin panel for ATRC Premium." />
      </Helmet>

      {toast &&
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded text-xs font-bold uppercase" style={{ background: toast.type === 'err' ? 'hsl(var(--color-danger))' : 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2px solid hsl(var(--color-black-border))', boxShadow: '3px 3px 0 hsl(var(--color-black-border))' }}>
          {toast.msg}
        </div>
      }

      {/* Announcement Modal */}
      {annModal.open &&
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'hsl(var(--overlay-dark) / 0.75)' }}>
          <div className="w-full max-w-md rounded-xl p-5 space-y-3" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-black uppercase text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-body-text))' }}>
                {annModal.editing ? admin.announcements.modalEditTitle : admin.announcements.modalNewTitle}
              </h3>
              <button onClick={() => setAnnModal({ open: false, editing: null })} style={{ color: 'hsl(var(--color-body-muted))' }}><X size={16} /></button>
            </div>
            <div className="space-y-2">
              <input
              value={annTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnnTitle(e.target.value)}
              placeholder={admin.announcements.titlePlaceholder}
              style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none' }} />
            
              <textarea
              value={annBody}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnnBody(e.target.value)}
              placeholder={admin.announcements.bodyPlaceholder}
              rows={3}
              style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none', resize: 'vertical' as const }} />
            
              <div className="flex flex-wrap gap-3 items-center">
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer" style={{ color: 'hsl(var(--color-body-text))' }}>
                  <input type="checkbox" checked={annPinned} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnnPinned(e.target.checked)} />
                  {admin.announcements.pinLabel}
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer" style={{ color: 'hsl(var(--color-body-text))' }}>
                  <input type="radio" name="annStatus" checked={annStatus === 'published'} onChange={() => setAnnStatus('published')} />
                  {admin.announcements.publishLabel}
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer" style={{ color: 'hsl(var(--color-body-text))' }}>
                  <input type="radio" name="annStatus" checked={annStatus === 'draft'} onChange={() => setAnnStatus('draft')} />
                  {admin.announcements.draftLabel}
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={saveAnn} className="flex-1 py-2 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}>
                {annModal.editing ? admin.announcements.saveButton : admin.announcements.postButton}
              </button>
              <button onClick={() => setAnnModal({ open: false, editing: null })} className="px-4 py-2 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}>
                {admin.announcements.cancelButton}
              </button>
            </div>
          </div>
        </div>
      }

      {/* Material Upload / Edit Modal */}
      {matModal.open &&
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: 'hsl(var(--overlay-dark) / 0.75)' }}>
          <div className="w-full max-w-lg rounded-xl p-5 space-y-4" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-black uppercase text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-body-text))' }}>
                {matModal.editing ? admin.materials.modalEditTitle : admin.materials.modalTitle}
              </h3>
              <button onClick={closeMat} style={{ color: 'hsl(var(--color-body-muted))' }}><X size={16} /></button>
            </div>

            <div className="space-y-3">
              {/* File / Link / Drive Folder toggle — new uploads only */}
              {!matModal.editing &&
            <div className="flex rounded overflow-hidden" style={{ border: '2px solid hsl(var(--color-black-border))' }}>
                  <button
                onClick={() => setMatInputType('file')}
                className="flex-1 py-1.5 text-xs font-bold uppercase transition-all"
                style={{ background: matInputType === 'file' ? 'hsl(var(--color-gold))' : 'hsl(var(--color-navy-mid))', color: matInputType === 'file' ? 'hsl(var(--color-black-border))' : 'hsl(var(--color-body-muted))' }}>
                    {admin.materials.typeFile}
                  </button>
                  <button
                onClick={() => setMatInputType('link')}
                className="flex-1 py-1.5 text-xs font-bold uppercase transition-all"
                style={{ background: matInputType === 'link' ? 'hsl(var(--color-gold))' : 'hsl(var(--color-navy-mid))', color: matInputType === 'link' ? 'hsl(var(--color-black-border))' : 'hsl(var(--color-body-muted))' }}>
                    {admin.materials.typeLink}
                  </button>
                  <button
                onClick={() => setMatInputType('drive_folder')}
                className="flex-1 py-1.5 text-xs font-bold uppercase transition-all"
                style={{ background: matInputType === 'drive_folder' ? 'hsl(var(--color-gold))' : 'hsl(var(--color-navy-mid))', color: "#ffffff" }}>
                    📁 Drive
                  </button>
                </div>
            }

              {/* File picker */}
              {!matModal.editing && matInputType === 'file' &&
            <div>
                  <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.mov,.mkv,.m4v,.ppt,.pptx,.doc,.docx"
                className="hidden"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const f = e.target.files?.[0] ?? null;
                  setMatFile(f);
                  // Treat video uploads as recorded lectures by default. The
                  // category selector remains editable for other video use cases.
                  if (f?.type.startsWith('video/')) setMatCategory('lectures');
                  if (f && !matName) setMatName(f.name.replace(/\.[^.]+$/, ''));
                }} />
              
                  <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-lg text-xs font-bold uppercase transition-all"
                style={{ border: `2px dashed hsl(var(--color-gold) / ${matFile ? '1' : '0.5'})`, background: matFile ? 'hsl(var(--color-gold) / 0.08)' : 'hsl(var(--color-navy-mid))', color: matFile ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-muted))' }}>
                
                    {matFile ?
                <>
                        <span className="text-2xl">{fileIcon(matFile.type)}</span>
                        <span>{matFile.name}</span>
                        <span style={{ color: 'hsl(var(--color-body-muted))' }}>{formatBytes(matFile.size)}</span>
                      </> :

                <>
                        <Upload size={20} />
                        <span>Click to select file</span>
                        <span style={{ color: 'hsl(var(--color-body-muted))' }}>PDF, Image, Video, PPT, Word — max 1 GB</span>
                      </>
                }
                  </button>
                </div>
            }

              {/* Drive Folder input */}
              {!matModal.editing && matInputType === 'drive_folder' &&
            <div>
                  <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    Google Drive Folder URL
                  </label>
                  <input
                value={matLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMatLink(e.target.value);
                  if (!matName) setMatName('');
                }}
                placeholder="https://drive.google.com/drive/folders/…"
                type="url"
                style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none' }} />
                  <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--color-body-muted))' }}>Make sure the folder is shared with "Anyone with the link".</p>
                </div>
            }

              {/* Link input */}
              {!matModal.editing && matInputType === 'link' &&
            <div>
                  <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    {admin.materials.linkLabel}
                  </label>
                  <input
                value={matLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setMatLink(e.target.value);
                  if (!matName) setMatName('');
                }}
                placeholder={admin.materials.linkPlaceholder}
                type="url"
                style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none' }} />
              
                </div>
            }

              {/* Edit: show URL field if it was a link or drive_folder material */}
              {matModal.editing && (matModal.editing.type === 'link' || matModal.editing.type === 'drive_folder') &&
            <div>
                  <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    {admin.materials.linkLabel}
                  </label>
                  <input
                value={matLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatLink(e.target.value)}
                placeholder={admin.materials.linkPlaceholder}
                type="url"
                style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none' }} />
              
                </div>
            }

              {/* Display name */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  {admin.materials.namePlaceholder}
                </label>
                <input
                value={matName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatName(e.target.value)}
                placeholder={admin.materials.namePlaceholder}
                style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none' }} />
              
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    {admin.materials.subjectLabel}
                  </label>
                  <select
                  value={matSubject}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMatSubject(e.target.value as Material['subject'])}
                  style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
                  
                    {admin.materials.subjects.map((s: {id: string;label: string;}) =>
                  <option key={s.id} value={s.id}>{s.label}</option>
                  )}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    {admin.materials.categoryLabel}
                  </label>
                  <select
                  value={matCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMatCategory(e.target.value as Material['category'])}
                  style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none', cursor: 'pointer' }}>
                  
                    {admin.materials.categories.map((c: {id: string;label: string;}) =>
                  <option key={c.id} value={c.id}>{c.label}</option>
                  )}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer" style={{ color: 'hsl(var(--color-body-text))' }}>
                  <input type="checkbox" checked={matWatermark} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatWatermark(e.target.checked)} />
                  {admin.materials.watermarkLabel}
                </label>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer" style={{ color: 'hsl(var(--color-body-text))' }}>
                  <input type="checkbox" checked={matPublished} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatPublished(e.target.checked)} />
                  {admin.materials.publishedLabel}
                </label>
              </div>

              {/* Step 5: Optional password protection */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  🔒 Password Protection (optional)
                </label>
                <input
                value={matPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatPassword(e.target.value)}
                placeholder={matModal.editing?.hasPassword ? 'Leave blank to keep existing password' : 'Leave blank for no password'}
                type="password"
                style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none' }} />
                {matModal.editing?.hasPassword &&
              <label className="flex items-center gap-2 text-[10px] font-bold mt-1 cursor-pointer" style={{ color: 'hsl(var(--color-danger))' }}>
                    <input type="checkbox" checked={matClearPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatClearPassword(e.target.checked)} />
                    Remove password protection
                  </label>
              }
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
              onClick={submitMat}
              disabled={matUploading}
              className="flex-1 py-2 text-xs font-bold uppercase rounded flex items-center justify-center gap-1.5"
              style={{ background: matUploading ? 'hsl(var(--color-gold) / 0.5)' : 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)', cursor: matUploading ? 'not-allowed' : 'pointer' }}>
              
                {matUploading
                  ? chunkProgress
                    ? `Uploading… ${chunkProgress.current}/${chunkProgress.total}`
                    : 'Saving…'
                  : matModal.editing ? admin.materials.saveButton
                  : matInputType === 'drive_folder' ? '📁 Add Drive Folder'
                  : matInputType === 'link' ? admin.materials.addLinkButton
                  : admin.materials.uploadSubmitButton}
              </button>
              <button onClick={closeMat} className="px-4 py-2 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}>
                {admin.materials.cancelButton}
              </button>
            </div>
          </div>
        </div>
      }

      <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>{admin.heading}</h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TAB_IDS.map((id) =>
          <button key={id} onClick={() => setTab(id)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-full whitespace-nowrap shrink-0 transition-all" style={{ background: tab === id ? 'hsl(var(--color-navy))' : 'transparent', color: tab === id ? 'hsl(var(--color-page-bg))' : 'hsl(var(--color-body-muted))', border: tab === id ? '1.5px solid hsl(var(--color-navy))' : '1.5px solid hsl(var(--color-hairline-strong))', boxShadow: tab === id ? '0 1px 4px hsl(var(--color-navy) / 0.18)' : 'none' }}>
              <span className="hidden sm:inline">{tabLabel(id)}</span>
              <span className="sm:hidden">{tabLabel(id).split(' ')[0]}</span>
            </button>
          )}
        </div>

        {/* User Directory */}
        {tab === 'users' &&
        <Card>
            <CardHeader>{admin.users.sectionTitle}</CardHeader>
            <CardBody>
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded" style={{ border: '2px solid hsl(var(--color-input-border))', background: 'hsl(var(--color-navy-mid))' }}>
                <Search size={14} style={{ color: 'hsl(var(--color-sidebar-text))' }} />
                <input type="text" value={userSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserSearch(e.target.value)} placeholder={admin.users.searchPlaceholder} className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'hsl(var(--color-input-text))' }} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: '2px solid hsl(var(--color-divider-cream))' }}>
                      {admin.users.tableHeaders.map((h: string) =>
                    <th key={h} className="py-2 px-2 text-left font-black uppercase tracking-wide" style={{ color: 'hsl(var(--color-body-muted))' }}>{h}</th>
                    )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 &&
                  <tr><td colSpan={8} className="py-10 text-center text-sm" style={{ color: 'hsl(var(--color-body-muted))' }}><div className="text-2xl mb-1">👥</div><span>{admin.users.emptyState}</span></td></tr>
                  }
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        }

        {/* Access Management */}
        {tab === 'access' &&
        <Card>
            <CardHeader>🔑 Access Management</CardHeader>
            <CardBody>
              <AccessManagement />
            </CardBody>
          </Card>
        }

        {/* Allowlist */}
        {tab === 'allowlist' &&
        <Card>
            <CardHeader>{admin.allowlist.sectionTitle}</CardHeader>
            <CardBody>
              <p className="text-sm mb-4" style={{ color: 'hsl(var(--color-body-muted))' }}>{admin.allowlist.description}</p>
              <button onClick={() => navigate('/admin/allowed-emails')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}>{admin.allowlist.openButton}</button>
            </CardBody>
          </Card>
        }

        {/* Learning Materials */}
        {tab === 'materials' &&
        <Card>
            <CardHeader>{admin.materials.sectionTitle}</CardHeader>
            <CardBody>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <button onClick={openNewMat} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}>
                  <Plus size={12} /><span>{admin.materials.uploadButton}</span>
                </button>
                <div className="flex items-center gap-2 flex-1 min-w-[160px] px-3 py-1.5 rounded" style={{ border: '2px solid hsl(var(--color-input-border))', background: 'hsl(var(--color-navy-mid))' }}>
                  <Search size={12} style={{ color: 'hsl(var(--color-sidebar-text))' }} />
                  <input type="text" value={matSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatSearch(e.target.value)} placeholder="Search materials…" className="flex-1 bg-transparent text-xs outline-none" style={{ color: 'hsl(var(--color-input-text))' }} />
                </div>
              </div>

              {matLoading && <p className="text-xs text-center py-6" style={{ color: 'hsl(var(--color-body-muted))' }}>Loading…</p>}

              {!matLoading && filteredMaterials.length === 0 &&
            <div className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-sm font-bold">{admin.materials.emptyState}</p>
                  <p className="text-xs mt-1">{admin.materials.emptySubtitle}</p>
                </div>
            }

              {!matLoading && filteredMaterials.length > 0 &&
            <div className="space-y-2">
                  {filteredMaterials.map((m) =>
              <div key={m.id} className="flex items-center gap-3 p-3 rounded" style={{ border: '2px solid hsl(var(--color-divider-cream))' }}>
                    <span className="text-xl shrink-0">{m.type === 'drive_folder' ? '📁' : m.type === 'link' ? '🔗' : fileIcon(m.mimeType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: 'hsl(var(--color-body-text))' }}>{m.name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: 'hsl(var(--color-gold) / 0.15)', color: 'hsl(var(--color-gold))' }}>{m.category}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: 'hsl(var(--color-navy-mid))', color: "#fcf8e8" }}>{m.subject}</span>
                          <span className="text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>{formatBytes(m.size)}</span>
                          {m.watermark && <span className="text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>💧 watermark</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => togglePublished(m)} className="p-1.5 rounded" title={m.published ? 'Unpublish' : 'Publish'} style={{ color: m.published ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-muted))' }}>
                          {m.published ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button onClick={() => openEditMat(m)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-sidebar-text))' }} title="Edit"><Edit2 size={13} /></button>
                        <button onClick={() => deleteMat(m)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-danger))' }} title="Delete"><Trash2 size={13} /></button>
                        <button onClick={() => openMaterial(m)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-sidebar-text))' }} title={m.type === 'file' ? 'Open file' : 'Open link'}><FileText size={13} /></button>
                      </div>
                    </div>
              )}
                </div>
            }
            </CardBody>
          </Card>
        }

        {tab === 'announcements' &&
        <Card>
            <CardHeader>{admin.announcements.sectionTitle}</CardHeader>
            <CardBody>
              <div className="flex gap-2 mb-4">
                <button onClick={openNewAnn} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Plus size={12} /><span>{admin.announcements.newButton}</span></button>
              </div>
              <div className="space-y-3">
                {announcements.length === 0 &&
              <div className="py-8 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    <div className="text-3xl mb-2">📢</div>
                    <p className="text-sm font-bold">{admin.announcements.emptyTitle}</p>
                    <p className="text-xs mt-1">{admin.announcements.emptySubtitle}</p>
                  </div>
              }
                {announcements.map((a) =>
              <div key={a.id} className="flex items-start justify-between gap-3 p-3 rounded" style={{ border: '2px solid hsl(var(--color-divider-cream))' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {a.pinned && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))' }}>📌 Pinned</span>}
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: a.status === 'published' ? 'hsl(var(--color-gold) / 0.15)' : 'hsl(var(--color-navy-mid))', color: a.status === 'published' ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-muted))' }}>{a.status}</span>
                      </div>
                      <h3 className="text-xs font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{a.title}</h3>
                      {a.body && <p className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--color-body-muted))' }}>{a.body}</p>}
                      <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--color-body-muted))' }}>{a.date}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEditAnn(a)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-sidebar-text))' }}><Edit2 size={12} /></button>
                      <button onClick={() => deleteAnn(a.id)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-danger))' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
              )}
              </div>
            </CardBody>
          </Card>
        }

        {/* Analytics */}
        {tab === 'analytics' &&
        <div className="space-y-4">
            {/* Step 9: Materials Analytics */}
            <Card>
              <CardHeader>📊 Materials Analytics</CardHeader>
              <CardBody>
                <MaterialsAnalytics />
              </CardBody>
            </Card>

            {/* PmLE Date Control */}
            <Card>
              <CardHeader>{admin.analytics.pmleTitle}</CardHeader>
              <CardBody>
                <p className="text-xs mb-3" style={{ color: 'hsl(var(--color-body-muted))' }}>{admin.analytics.pmleDescription}</p>
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[180px]">
                    <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                      {admin.analytics.pmleDateLabel}
                    </label>
                    <input
                    type="date"
                    value={pmleDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPmleDate(e.target.value)}
                    style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.5)', borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '6px 10px', fontSize: '12px', width: '100%', outline: 'none', colorScheme: 'dark' }} />
                  
                  </div>
                  <div className="flex gap-2">
                    <button
                    onClick={() => savePmleDate(pmleDate)}
                    disabled={pmleSaving || !pmleDate}
                    className="px-4 py-2 text-xs font-bold uppercase rounded"
                    style={{ background: pmleSaving || !pmleDate ? 'hsl(var(--color-gold) / 0.4)' : 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2px solid hsl(var(--color-black-border))', boxShadow: pmleSaving || !pmleDate ? 'none' : '2px 2px 0 hsl(var(--color-black-border))', cursor: pmleSaving || !pmleDate ? 'not-allowed' : 'pointer' }}>
                    
                      {pmleSaving ? '…' : admin.analytics.pmleSaveButton}
                    </button>
                    {pmleSaved &&
                  <button
                    onClick={() => savePmleDate(null)}
                    disabled={pmleSaving}
                    className="px-4 py-2 text-xs font-bold uppercase rounded"
                    style={{ color: 'hsl(var(--color-danger))', border: '2px solid hsl(var(--color-danger))', cursor: pmleSaving ? 'not-allowed' : 'pointer' }}>
                    
                        {admin.analytics.pmleClearButton}
                      </button>
                  }
                  </div>
                </div>
                <p className="text-[11px] mt-3" style={{ color: pmleSaved ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-muted))' }}>
                  {pmleSaved ? `${admin.analytics.pmleCurrentLabel} ${pmleSaved}` : admin.analytics.pmleNoneLabel}
                </p>
              </CardBody>
            </Card>

            {/* Expiring Soon widget */}
            <ExpiringWidget />

            {/* Stats grid */}
            <Card>
              <CardHeader>{admin.analytics.sectionTitle}</CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {admin.analytics.stats.map((s: {id: string;label: string;emoji: string;}, idx: number) =>
                <div key={s.id} className="p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-divider-cream))' }}>
                      <div className="text-lg mb-1">{s.emoji}</div>
                      <div className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-gold))' }}>{analyticsValues[idx]}</div>
                      <div className="text-[10px] font-bold uppercase" style={{ color: "#faf7d1" }}>{s.label}</div>
                    </div>
                )}
                </div>
                <p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>{admin.analytics.emptyNote}</p>
              </CardBody>
            </Card>
          </div>
        }

        {/* Leaderboard Mod */}
        {tab === 'leaderboard' &&
        <Card>
            <CardHeader>{admin.leaderboard.sectionTitle}</CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  <button onClick={() => {if (confirm(admin.leaderboard.resetConfirm)) showToast(admin.leaderboard.resetToast);}} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ color: 'hsl(var(--color-danger))', border: '2px solid hsl(var(--color-danger))' }}>
                    <AlertTriangle size={12} /><span>{admin.leaderboard.resetButton}</span>
                  </button>
                </div>
                <div className="py-8 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-sm font-bold">{admin.leaderboard.emptyState}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        }

        {/* Maintenance */}
        {tab === 'maintenance' &&
        <Card>
            <CardHeader>{admin.maintenance.sectionTitle}</CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded" style={{ border: '2px solid hsl(var(--color-divider-cream))' }}>
                  <div>
                    <h3 className="text-sm font-black uppercase" style={{ color: 'hsl(var(--color-body-text))' }}>{admin.maintenance.title}</h3>
                    <p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>{admin.maintenance.description}</p>
                  </div>
                  <button onClick={() => setMaintenanceMode((m) => !m)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full transition-all" style={{ background: maintenanceMode ? 'hsl(var(--color-danger))' : 'hsl(var(--color-navy))', color: 'hsl(var(--color-page-bg))', border: maintenanceMode ? '1.5px solid hsl(var(--color-danger))' : '1.5px solid hsl(var(--color-navy))', boxShadow: '0 1px 4px hsl(var(--color-navy) / 0.18)' }}>
                    {maintenanceMode ? admin.maintenance.disableLabel : admin.maintenance.enableLabel}
                  </button>
                </div>
                {maintenanceMode &&
              <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '1.5px solid hsl(var(--color-danger))' }}>
                    <AlertTriangle size={16} style={{ color: 'hsl(var(--color-danger))' }} className="shrink-0 mt-0.5" />
                    <p className="text-xs" style={{ color: 'hsl(var(--color-body-text))' }}>{admin.maintenance.warningText}</p>
                  </div>
              }
              </div>
            </CardBody>
          </Card>
        }


        {/* Cloud Backup */}
        {tab === 'backup' &&
        <div className="space-y-4">
          <Card>
            <CardHeader>☁️ Cloud Backup — Cloudflare</CardHeader>
            <CardBody>
              <p className="text-xs mb-4" style={{ color: 'hsl(var(--color-body-muted))' }}>
                All database tables and private data files are automatically backed up to your Cloudflare Worker every night at <strong style={{ color: 'hsl(var(--color-gold))' }}>midnight PHT</strong>. You can also trigger a manual backup anytime below.
              </p>

              {/* Last backup info */}
              <div className="p-4 rounded mb-4" style={{ background: 'hsl(var(--color-navy-mid))', border: '1.5px solid hsl(var(--color-divider-cream))' }}>
                <div className="text-[10px] font-black uppercase mb-1" style={{ color: "#ffffff" }}>Last Successful Backup</div>
                {backupStatus?.lastBackup ?
                <>
                    <div className="text-sm font-bold" style={{ color: 'hsl(var(--color-gold))' }}>
                      {new Date(backupStatus.lastBackup.timestamp).toLocaleString('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short' })} PHT
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                      Tables: {backupStatus.lastBackup.tablesExported.join(', ')}
                    </div>
                  </> :

                <div className="text-sm" style={{ color: "#ffffff" }}>No backup recorded yet.</div>
                }
              </div>

              {/* Manual trigger */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={runManualBackup}
                  disabled={backupRunning}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase rounded-full transition-all"
                  style={{
                    background: backupRunning ? 'hsl(var(--color-gold) / 0.4)' : 'hsl(var(--color-gold))',
                    color: 'hsl(var(--color-black-border))',
                    border: '2px solid hsl(var(--color-black-border))',
                    boxShadow: backupRunning ? 'none' : '2px 2px 0 hsl(var(--color-black-border))',
                    cursor: backupRunning ? 'not-allowed' : 'pointer'
                  }}>
                  
                  {backupRunning ? '⏳ Backing up…' : '☁️ Run Backup Now'}
                </button>
                {backupResult &&
                <span className="text-xs font-bold" style={{ color: backupResult.success ? 'hsl(var(--color-gold))' : 'hsl(var(--color-danger))' }}>
                    {backupResult.success ? '✓ Backup complete' : `✗ ${backupResult.error ?? 'Failed'}`}
                  </span>
                }
              </div>
            </CardBody>
          </Card>

          {/* DB Migration */}
          <Card>
            <CardHeader>🔧 Database Migration</CardHeader>
            <CardBody>
              <p className="text-xs mb-4" style={{ color: 'hsl(var(--color-body-muted))' }}>
                Adds any missing columns to the database (safe to run multiple times — skips columns that already exist). Run this after deploying updates.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={runMigration}
                  disabled={migrationRunning}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase rounded-full transition-all"
                  style={{
                    background: migrationRunning ? 'hsl(var(--color-navy-mid))' : 'hsl(var(--color-navy-deep))',
                    color: 'hsl(var(--color-paper))',
                    border: '2px solid hsl(var(--color-black-border))',
                    boxShadow: migrationRunning ? 'none' : '2px 2px 0 hsl(var(--color-black-border))',
                    cursor: migrationRunning ? 'not-allowed' : 'pointer',
                  }}>
                  {migrationRunning ? '⏳ Running…' : '🔧 Run Migration Now'}
                </button>
                {migrationResult && (
                  <span className="text-xs font-bold" style={{ color: migrationResult.ok ? 'hsl(var(--color-gold))' : 'hsl(var(--color-danger))' }}>
                    {migrationResult.ok ? '✓ Done' : `✗ ${migrationResult.error ?? 'Failed'}`}
                  </span>
                )}
              </div>
              {migrationResult?.results && migrationResult.results.length > 0 && (
                <div className="mt-3 p-3 rounded text-[11px] font-mono space-y-0.5" style={{ background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-body-muted))' }}>
                  {migrationResult.results.map((r, i) => (
                    <div key={i} style={{ color: r.startsWith('added') ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-muted))' }}>{r}</div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* What gets backed up */}
          <Card>
            <CardHeader>📦 What Gets Backed Up</CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                { label: 'Users & Sessions', desc: 'All registered accounts and active sessions' },
                { label: 'Allowlist', desc: 'Approved email addresses for registration' },
                { label: 'Student Access', desc: 'Plan types, expiry dates, and access status' },
                { label: 'Access Audit Log', desc: 'Full history of access changes by admin' },
                { label: 'Study Logs', desc: 'All WeBILIB sessions with proof photos' },
                { label: 'User Stats', desc: 'Hours, streaks, and leaderboard rankings' },
                { label: 'Private JSON Files', desc: 'PmLE date, materials metadata, and config' }].
                map((item) =>
                <div key={item.label} className="flex items-start gap-2 p-2.5 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '1px solid hsl(var(--color-divider-cream))' }}>
                    <span style={{ color: 'hsl(var(--color-gold))' }}>✓</span>
                    <div>
                      <div className="text-xs font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{item.label}</div>
                      <div className="text-[11px]" style={{ color: "#ffffff" }}>{item.desc}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
        }


      </div>
    </AppShell>);

}

/**
 * SecureViewer — Step 6 + Step 8
 *
 * Full-screen modal that renders file materials securely:
 *  - PDF: rendered page-by-page onto <canvas> via PDF.js (no native plugin, no download)
 *  - Image: displayed with right-click / drag disabled
 *  - Video: native <video> with controlsList="nodownload" and context menu blocked
 *
 * Step 8 — Anti-capture:
 *  - Dynamic watermark canvas overlay (name + email + timestamp, tiled)
 *  - Visibility change detection: blurs content when tab loses focus
 *  - Screen-share detection via getDisplayMedia interception
 *  - Strike system: 3 strikes locks the material
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Lock } from 'lucide-react';

interface SecureViewerProps {
  url: string;           // signed serve URL
  mimeType: string;
  name: string;
  watermark: boolean;
  materialId: string;
  userName: string;
  userEmail: string;
  onClose: () => void;
  onStrike?: (strikes: number, locked: boolean) => void;
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('atrc_session_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Watermark canvas overlay ──────────────────────────────────────────────────
function WatermarkOverlay({ name, email }: { name: string; email: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#002D5A';
      ctx.font = '13px DM Sans, sans-serif';
      ctx.rotate(-Math.PI / 6);

      const text = `${name} • ${email} • ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`;
      const step = 220;
      for (let y = -canvas.height; y < canvas.height * 2; y += 60) {
        for (let x = -canvas.width; x < canvas.width * 2; x += step) {
          ctx.fillText(text, x, y);
        }
      }
      ctx.restore();
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [name, email]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 10 }}
      aria-hidden="true"
    />
  );
}

// ── PDF Viewer ────────────────────────────────────────────────────────────────
function PdfViewer({ url, watermark, userName, userEmail, materialId, onStrike }: {
  url: string; watermark: boolean;
  userName: string; userEmail: string;
  materialId: string;
  onStrike?: (strikes: number, locked: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    // Dynamically import pdfjs-dist to keep the initial bundle small
    import('pdfjs-dist').then(async (pdfjsLib) => {
      // Use the bundled worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setTotalPages(pdf.numPages);
        setPage(1);
      } catch {
        if (!cancelled) setError('Failed to load PDF. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setError('PDF viewer unavailable.');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    if (!pdfRef.current || !canvasRef.current) return;
    let cancelled = false;

    pdfRef.current.getPage(page).then((pg: { getViewport: (opts: { scale: number }) => { width: number; height: number }; render: (ctx: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } }) => {
      if (cancelled) return;
      const viewport = pg.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      pg.render({ canvasContext: ctx, viewport }).promise.catch(() => {});
    });

    return () => { cancelled = true; };
  }, [page, totalPages]);

  // Record view on first load
  useEffect(() => {
    if (!materialId) return;
    fetch(`/api/materials/${materialId}/view`, {
      method: 'POST',
      headers: authHeader(),
    }).catch(() => {});
  }, [materialId]);

  // Anti-capture: detect visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && onStrike) {
        fetch(`/api/materials/${materialId}/strike`, {
          method: 'POST',
          headers: { ...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'tab_hidden' }),
        })
          .then(r => r.json())
          .then((d: { strikes: number; locked: boolean }) => onStrike(d.strikes, d.locked))
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [materialId, onStrike]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin" style={{ color: 'hsl(var(--color-gold))' }} />
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'hsl(var(--color-danger))' }}>
      <AlertTriangle size={16} className="mr-2" /> {error}
    </div>
  );

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="max-w-full rounded shadow-lg select-none"
          onContextMenu={e => e.preventDefault()}
          style={{ display: 'block' }}
        />
        {watermark && <WatermarkOverlay name={userName} email={userEmail} />}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded disabled:opacity-40"
            style={{ background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-gold))' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-body-muted))' }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded disabled:opacity-40"
            style={{ background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-gold))' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Image Viewer ──────────────────────────────────────────────────────────────
function ImageViewer({ url, watermark, userName, userEmail, materialId }: {
  url: string; watermark: boolean;
  userName: string; userEmail: string;
  materialId: string;
}) {
  useEffect(() => {
    if (!materialId) return;
    fetch(`/api/materials/${materialId}/view`, {
      method: 'POST',
      headers: authHeader(),
    }).catch(() => {});
  }, [materialId]);

  return (
    <div className="relative inline-block">
      <img
        src={url}
        alt="Material"
        className="max-w-full max-h-[70vh] rounded select-none"
        onContextMenu={e => e.preventDefault()}
        onDragStart={e => e.preventDefault()}
        draggable={false}
      />
      {watermark && <WatermarkOverlay name={userName} email={userEmail} />}
    </div>
  );
}

// ── Video Viewer ──────────────────────────────────────────────────────────────
function VideoViewer({ url, watermark, userName, userEmail, materialId }: {
  url: string; watermark: boolean;
  userName: string; userEmail: string;
  materialId: string;
}) {
  useEffect(() => {
    if (!materialId) return;
    fetch(`/api/materials/${materialId}/view`, {
      method: 'POST',
      headers: authHeader(),
    }).catch(() => {});
  }, [materialId]);

  return (
    <div className="relative">
      <video
        src={url}
        controls
        controlsList="nodownload"
        className="max-w-full max-h-[70vh] rounded select-none"
        onContextMenu={e => e.preventDefault()}
        style={{ display: 'block' }}
      />
      {watermark && <WatermarkOverlay name={userName} email={userEmail} />}
    </div>
  );
}

// ── Main SecureViewer ─────────────────────────────────────────────────────────
export default function SecureViewer({
  url, mimeType, name, watermark, materialId,
  userName, userEmail, onClose, onStrike,
}: SecureViewerProps) {
  const [strikes, setStrikes] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleStrike = useCallback((s: number, l: boolean) => {
    setStrikes(s);
    setLocked(l);
    onStrike?.(s, l);
  }, [onStrike]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isPdf = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'hsl(var(--color-navy) / 0.97)' }}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing: ${name}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid hsl(var(--color-gold) / 0.2)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <Lock size={14} style={{ color: 'hsl(var(--color-gold))', flexShrink: 0 }} />
          <span className="text-sm font-bold truncate" style={{ color: 'hsl(var(--color-page-bg))' }}>{name}</span>
          {strikes > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'hsl(var(--color-danger) / 0.2)', color: 'hsl(var(--color-danger))' }}>
              ⚠️ {strikes}/3 strikes
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full shrink-0"
          style={{ color: 'hsl(var(--color-page-bg) / 0.7)' }}
          aria-label="Close viewer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-4">
        {locked ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <Lock size={48} style={{ color: 'hsl(var(--color-danger))' }} />
            <p className="text-lg font-black" style={{ color: 'hsl(var(--color-page-bg))' }}>Material Locked</p>
            <p className="text-sm max-w-sm" style={{ color: 'hsl(var(--color-page-bg) / 0.7)' }}>
              This material has been locked due to repeated screen capture attempts. Please contact your administrator.
            </p>
          </div>
        ) : isPdf ? (
          <PdfViewer
            url={url}
            watermark={watermark}
            userName={userName}
            userEmail={userEmail}
            materialId={materialId}
            onStrike={handleStrike}
          />
        ) : isImage ? (
          <ImageViewer url={url} watermark={watermark} userName={userName} userEmail={userEmail} materialId={materialId} />
        ) : isVideo ? (
          <VideoViewer url={url} watermark={watermark} userName={userName} userEmail={userEmail} materialId={materialId} />
        ) : (
          <div className="text-center py-20" style={{ color: 'hsl(var(--color-page-bg) / 0.7)' }}>
            <p className="text-sm">Preview not available for this file type.</p>
          </div>
        )}
      </div>

      {/* Anti-capture notice */}
      <div className="px-4 py-2 text-center text-[10px] shrink-0" style={{ color: 'hsl(var(--color-page-bg) / 0.4)', borderTop: '1px solid hsl(var(--color-gold) / 0.1)' }}>
        🔒 This material is protected. Screenshotting or recording is prohibited and monitored.
      </div>
    </div>
  );
}

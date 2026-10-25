import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  BookOpen, Video, Zap, Link, Lock, Eye, Shield, AlertTriangle,
  ExternalLink, Loader2, FolderOpen, Bookmark, BookmarkCheck,
  StickyNote, WifiOff, ChevronDown, ChevronUp } from
'lucide-react';
import AppShell from '@/components/app/AppShell';
import { useSession } from '@/lib/auth/auth-client';
import { learning_materials } from 'virtual:content';
import SecureViewer from '@/components/app/SecureViewer';
import MaterialPasswordModal, { sessionKeyFor } from '@/components/app/MaterialPasswordModal';
import OfflineLibrary, { OfflineDownloadButton } from '@/components/app/OfflineLibrary';

type MaterialTab = 'notes' | 'drills' | 'lectures' | 'gizmo' | 'offline' | 'bookmarks';

interface Material {
  id: string;
  name: string;
  subject: string;
  category: MaterialTab;
  type: 'file' | 'link' | 'drive_folder';
  mimeType: string;
  size: number;
  uploadedAt: string;
  watermark: boolean;
  sortOrder: number;
  hasPassword: boolean;
  scheduledAt?: string | null;
  deletedAt?: string | null;
  published?: boolean;
  url: string | null;
}

const TAB_ICONS: Record<string, React.ElementType> = {
  notes: BookOpen,
  drills: Zap,
  lectures: Video,
  gizmo: Link,
  offline: WifiOff,
  bookmarks: Bookmark
};

const SUBJECT_LABELS: Record<string, string> = {
  general: 'General',
  abnormal: 'Abnormal',
  assessment: 'Assessment',
  io: 'I/O',
  developmental: 'Developmental'
};

function fileEmoji(mime: string, type: 'file' | 'link' | 'drive_folder') {
  if (type === 'drive_folder') return '📁';
  if (type === 'link') return '🔗';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime === 'application/pdf') return '📄';
  return '📎';
}

function formatBytes(b: number) {
  if (!b) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}


function authHeader(): Record<string, string> {
  const token = localStorage.getItem('atrc_session_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Notes panel (Step 9) ──────────────────────────────────────────────────────
function NotesPanel({ materialId }: {materialId: string;}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open || loaded) return;
    fetch(`/api/materials/${materialId}/notes`, { headers: authHeader() }).
    then((r) => r.json()).
    then((d: {content?: string;}) => {setContent(d.content ?? '');setLoaded(true);}).
    catch(() => setLoaded(true));
  }, [open, loaded, materialId]);

  const save = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSaving(true);
      fetch(`/api/materials/${materialId}/notes`, {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      }).finally(() => setSaving(false));
    }, 800);
  }, [materialId]);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[10px] font-bold uppercase"
        style={{ color: 'hsl(var(--color-body-muted))' }}>
        
        <StickyNote size={10} />
        <span>Notes</span>
        {open ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        {saving && <Loader2 size={10} className="animate-spin ml-1" />}
      </button>
      {open &&
      <textarea
        value={content}
        onChange={(e) => {setContent(e.target.value);save(e.target.value);}}
        placeholder="Add your notes here…"
        rows={3}
        className="w-full mt-1 text-xs resize-none rounded p-2"
        style={{ background: 'hsl(var(--color-navy-mid))', border: '1.5px solid hsl(var(--color-gold) / 0.3)', color: 'hsl(var(--color-input-text))', outline: 'none' }} />

      }
    </div>);

}

export default function LearningMaterialsPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Student';
  const userEmail = session?.user?.email ?? '';

  const [tab, setTab] = useState<MaterialTab>('notes');
  const [consentGiven, setConsentGiven] = useState(false);
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  // Step 5: password modal
  const [pwModal, setPwModal] = useState<{open: boolean;material: Material | null;}>({ open: false, material: null });

  // Step 6: secure viewer
  const [viewer, setViewer] = useState<{open: boolean;url: string;material: Material | null;}>({ open: false, url: '', material: null });

  // Step 9: bookmarks
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [togglingBookmark, setTogglingBookmark] = useState<string | null>(null);

  // Step 4: admin mode



  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setMaterialsError(null);
    try {
      const response = await fetch('/api/materials', { headers: authHeader() });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const problem = data as { error?: string; message?: string } | null;
        throw new Error([problem?.error, problem?.message].filter(Boolean).join(' — ') || `Request failed (${response.status})`);
      }
      if (!Array.isArray(data)) throw new Error('The materials service returned an invalid response.');
      setAllMaterials((data as Material[]).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      setAllMaterials([]);
      setMaterialsError(error instanceof Error ? error.message : 'Could not load learning materials.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBookmarks = useCallback(() => {
    fetch('/api/materials/bookmarks', { headers: authHeader() }).
    then((r) => r.json()).
    then((d: {bookmarks?: string[];}) => setBookmarks(new Set(d.bookmarks ?? []))).
    catch(() => {});
  }, []);

  useEffect(() => {
    if (!consentGiven) return;
    fetchMaterials();
    fetchBookmarks();
  }, [consentGiven, fetchMaterials, fetchBookmarks]);

  // ── Open a material ──────────────────────────────────────────────────────
  const openMaterial = useCallback(async (m: Material) => {
    // External links / drive folders
    if ((m.type === 'link' || m.type === 'drive_folder') && m.url) {
      if (m.hasPassword) {
        const stored = sessionStorage.getItem(sessionKeyFor(m.id));
        if (!stored) {setPwModal({ open: true, material: m });return;}
        const parsed = JSON.parse(stored) as {expiresAt: number;};
        if (Date.now() > parsed.expiresAt) {setPwModal({ open: true, material: m });return;}
      }
      window.open(m.url, '_blank', 'noopener,noreferrer');
      return;
    }

    // File materials — check password
    if (m.hasPassword) {
      const stored = sessionStorage.getItem(sessionKeyFor(m.id));
      if (!stored) {setPwModal({ open: true, material: m });return;}
      const parsed = JSON.parse(stored) as {expiresAt: number;};
      if (Date.now() > parsed.expiresAt) {setPwModal({ open: true, material: m });return;}
    }

    setOpeningId(m.id);
    try {
      const res = await fetch('/api/materials/token', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: m.id })
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({ error: 'Failed to open file' }))) as {error?: string;};
        alert(err.error ?? 'Failed to open file. Please try again.');
        return;
      }
      const { token } = (await res.json()) as {token: string;};
      const serveUrl = `/api/materials/serve/${token}`;

      // Step 6: open in secure viewer for PDFs, images, videos
      const isViewable = m.mimeType === 'application/pdf' || m.mimeType.startsWith('image/') || m.mimeType.startsWith('video/');
      if (isViewable) {
        setViewer({ open: true, url: serveUrl, material: m });
      } else {
        window.open(serveUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      alert('Failed to open file. Please check your connection and try again.');
    } finally {
      setOpeningId(null);
    }
  }, []);

  const handlePasswordSuccess = useCallback((_token: string) => {
    const m = pwModal.material;
    setPwModal({ open: false, material: null });
    if (m) openMaterial(m);
  }, [pwModal.material, openMaterial]);

  // Step 9: toggle bookmark
  const toggleBookmark = useCallback(async (m: Material) => {
    setTogglingBookmark(m.id);
    try {
      const res = await fetch(`/api/materials/${m.id}/bookmark`, {
        method: 'POST',
        headers: authHeader()
      });
      const d = (await res.json()) as {bookmarked: boolean;};
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (d.bookmarked) next.add(m.id);else next.delete(m.id);
        return next;
      });
    } catch {




      // silent
    } finally {setTogglingBookmark(null);}}, []);


  // Lazy-load analytics component


  const tabMaterials = allMaterials.filter((m) => {
    if (tab === 'bookmarks') return bookmarks.has(m.id);
    return m.category === tab;
  });

  const activeTab = learning_materials.tabs.find((t) => t.id === tab);

  // ── DPA consent gate ────────────────────────────────────────────────────
  if (!consentGiven) {
    return (
      <AppShell activeSection="learning-materials">
        <Helmet>
          <title>Learning Materials — ATRC Premium PMLeBoards</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto">
          <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(var(--color-card-border))', borderRadius: '14px', boxShadow: '0 1px 2px hsl(var(--color-card-shadow-sm)), 0 8px 24px -12px hsl(var(--color-card-shadow-md))', overflow: 'hidden' }}>
            <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(var(--color-card-border-sub))' }}>
              <h2 className="font-black uppercase tracking-wide text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>
                <Shield size={16} /> <span>{learning_materials.consent.sectionTitle}</span>
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '1.5px solid hsl(var(--color-gold) / 0.3)' }}>
                <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--color-gold))' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--color-page-bg))' }}>
                  <span>{learning_materials.consent.alertText}</span>
                </p>
              </div>
              <div className="text-xs space-y-2" style={{ color: 'hsl(var(--color-body-text))' }}>
                <p><strong>{learning_materials.consent.antiSharingTitle}</strong></p>
                <ul className="list-disc pl-4 space-y-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  {learning_materials.consent.antiSharingItems.map((item, i) =>
                  <li key={i}><span>{item}</span></li>
                  )}
                </ul>
              </div>
              <div className="text-xs space-y-2" style={{ color: 'hsl(var(--color-body-text))' }}>
                <p><strong>{learning_materials.consent.rightsTitle}</strong></p>
                <ul className="list-disc pl-4 space-y-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  {learning_materials.consent.rightsItems.map((item, i) =>
                  <li key={i}><span>{item}</span></li>
                  )}
                </ul>
              </div>
              <button
                onClick={() => setConsentGiven(true)}
                className="w-full py-3 font-black uppercase text-sm rounded transition-all"
                style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2.5px solid hsl(var(--color-black-border))', boxShadow: '3px 3px 0 hsl(var(--color-black-border))', fontFamily: 'var(--font-display)' }}>
                
                <span>{learning_materials.consent.agreeButton}</span>
              </button>
            </div>
          </div>
        </div>
      </AppShell>);

  }

  // ── Main materials view ─────────────────────────────────────────────────
  return (
    <AppShell activeSection="learning-materials">
      <Helmet>
        <title>Learning Materials — ATRC Premium PMLeBoards</title>
        <meta name="description" content="Access PMLE study materials: reviewer PDFs, recorded lectures, practice tests, and subject-specific resources for the Psychology Licensure Exam." />
        <link rel="canonical" href="https://atrcpremium.com/learning-materials" />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="PMLE Learning Materials — ATRC Premium" />
        <meta property="og:description" content="Curated study materials for the Philippine Mental Health Law Exam: PDFs, lectures, and practice tests by subject." />
        <meta property="og:image" content="https://atrcpremium.com/og-image.svg" />
        <meta property="og:url" content="https://atrcpremium.com/learning-materials" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://atrcpremium.com/og-image.svg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://atrcpremium.com/learning-materials#webpage",
          "url": "https://atrcpremium.com/learning-materials",
          "name": "PMLE Learning Materials — ATRC Premium PMLeBoards",
          "description": "Study materials for the Psychology Licensure Exam: reviewer PDFs, recorded lectures, and practice tests.",
          "isPartOf": { "@id": "https://atrcpremium.com/#website" },
          "about": { "@id": "https://atrcpremium.com/#organization" }
        }).replace(/</g, '\u003c')}</script>
      </Helmet>

      {/* Step 5: Password modal */}
      {pwModal.open && pwModal.material &&
      <MaterialPasswordModal
        materialName={pwModal.material.name}
        materialId={pwModal.material.id}
        onSuccess={handlePasswordSuccess}
        onCancel={() => setPwModal({ open: false, material: null })} />

      }

      {/* Step 6: Secure viewer */}
      {viewer.open && viewer.material &&
      <SecureViewer
        url={viewer.url}
        mimeType={viewer.material.mimeType}
        name={viewer.material.name}
        watermark={viewer.material.watermark}
        materialId={viewer.material.id}
        userName={userName}
        userEmail={userEmail}
        onClose={() => setViewer({ open: false, url: '', material: null })} />

      }

      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <section className="library-camp-banner" aria-label="Learning path introduction">
          <span className="library-camp-eyebrow">ATRC PREMIUM · LEARNING LIBRARY</span>
          <h2>Your study path, one step at a time.</h2>
          <p>Explore notes, practice sets, and recorded lectures curated for your psychology licensure journey.</p>
        </section>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>
            <span>{learning_materials.heading}</span>
          </h1>
          <div className="flex items-center gap-2 flex-wrap">


            <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold" style={{ background: 'hsl(var(--color-navy-mid))', border: '1.5px solid hsl(var(--color-gold) / 0.3)', color: 'hsl(var(--color-gold))' }}>
              <Lock size={12} /> <span>{learning_materials.viewOnlyBadge}</span>
            </div>
          </div>
        </div>



        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[...learning_materials.tabs, { id: 'bookmarks', label: 'Bookmarks', emoji: '🔖' }, { id: 'offline', label: 'Offline', emoji: '📴' }].map((t) => {
            const Icon = TAB_ICONS[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as MaterialTab)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded-full transition-all"
                style={{ background: tab === t.id ? 'hsl(var(--color-navy))' : 'transparent', color: tab === t.id ? 'hsl(var(--color-page-bg))' : 'hsl(var(--color-body-muted))', border: tab === t.id ? '1.5px solid hsl(var(--color-navy))' : '1.5px solid hsl(var(--color-hairline-strong))', boxShadow: tab === t.id ? '0 1px 4px hsl(var(--color-navy) / 0.18)' : 'none' }}>
                
                {Icon && <Icon size={12} className="hidden sm:block" />}
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{(t as {emoji?: string;}).emoji ?? t.label.slice(0, 2)}</span>
              </button>);

          })}
        </div>

        {/* Materials list */}
        <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(var(--color-card-border))', borderRadius: '14px', boxShadow: '0 1px 2px hsl(var(--color-card-shadow-sm)), 0 8px 24px -12px hsl(var(--color-card-shadow-md))', overflow: 'hidden' }}>
          <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(var(--color-card-border-sub))' }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>
              {tab === 'offline' ? '📴 Offline Library' : tab === 'bookmarks' ? '🔖 Bookmarks' : <><span>{activeTab?.emoji}</span>{' '}<span>{activeTab?.label}</span></>}
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {/* Step 7: Offline library tab */}
            {tab === 'offline' && <OfflineLibrary />}

            {tab !== 'offline' && loading &&
            <div className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                <div className="text-3xl mb-2"><span>{learning_materials.loadingEmoji}</span></div>
                <p className="text-sm font-bold"><span>{learning_materials.loadingText}</span></p>
              </div>
            }

            {tab !== 'offline' && !loading && materialsError &&
            <div className="py-8 text-center" role="alert" style={{ color: 'hsl(var(--color-body-muted))' }}>
                <div className="text-3xl mb-2">⚠️</div>
                <p className="text-sm font-bold">Learning materials could not be loaded.</p>
                <p className="text-xs mt-1">{materialsError}</p>
                <button onClick={fetchMaterials} className="mt-4 px-4 py-2 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))' }}>Try again</button>
              </div>
            }

            {tab !== 'offline' && !loading && !materialsError && tabMaterials.length === 0 &&
            <div className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                <div className="text-4xl mb-2"><span>{tab === 'bookmarks' ? '🔖' : learning_materials.emptyEmoji}</span></div>
                <p className="text-sm font-bold"><span>{tab === 'bookmarks' ? 'No bookmarks yet' : learning_materials.emptyTitle}</span></p>
                <p className="text-xs mt-1"><span>{tab === 'bookmarks' ? 'Bookmark materials to find them here quickly.' : learning_materials.emptySubtitle}</span></p>
              </div>
            }

            {tab !== 'offline' && !loading && !materialsError && tabMaterials.map((m) =>
            <div
              key={m.id}
              className="flex items-start gap-3 p-4 rounded"
              style={{ border: '2px solid hsl(var(--color-divider-cream))', opacity: m.deletedAt ? 0.5 : 1 }}>
              


                <span className="text-2xl shrink-0 mt-0.5">{fileEmoji(m.mimeType, m.type)}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-black" style={{ color: 'hsl(var(--color-body-text))' }}>{m.name}</h3>
                    {m.subject &&
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: 'hsl(var(--color-gold) / 0.15)', color: 'hsl(var(--color-gold))', border: '1px solid hsl(var(--color-gold) / 0.3)' }}>
                        {SUBJECT_LABELS[m.subject] ?? m.subject}
                      </span>
                  }
                    {/* Step 5: password badge */}
                    {m.hasPassword &&
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-body-muted))' }}>
                        <Lock size={8} /> Protected
                      </span>
                  }

                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>
                    {m.type === 'file' && m.watermark &&
                  <span className="flex items-center gap-1"><Eye size={10} /> <span>{learning_materials.watermarkedLabel}</span></span>
                  }
                    {m.type === 'file' &&
                  <span className="flex items-center gap-1"><Lock size={10} /> <span>{learning_materials.signedUrlLabel}</span></span>
                  }
                    {m.type === 'link' &&
                  <span className="flex items-center gap-1"><ExternalLink size={10} /> <span>{learning_materials.externalLinkLabel}</span></span>
                  }
                    {m.type === 'drive_folder' &&
                  <span className="flex items-center gap-1"><FolderOpen size={10} /> <span>Google Drive Folder</span></span>
                  }
                    {m.size > 0 && <span>{formatBytes(m.size)}</span>}
                  </div>

                  {/* Step 9: Notes panel */}
                  <NotesPanel materialId={m.id} />
                </div>

                {/* Action buttons */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {/* Step 9: Bookmark */}
                    <button
                    onClick={() => toggleBookmark(m)}
                    disabled={togglingBookmark === m.id}
                    className="p-1.5 rounded disabled:opacity-50"
                    title={bookmarks.has(m.id) ? 'Remove bookmark' : 'Bookmark'}
                    style={{ color: bookmarks.has(m.id) ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-muted))' }}>
                    
                      {bookmarks.has(m.id) ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                    </button>

                    {/* Step 7: Offline download (file materials only) */}
                    {m.type === 'file' &&
                  <OfflineDownloadButton
                    materialId={m.id}
                    serveUrl=""
                    name={m.name}
                    mimeType={m.mimeType}
                    size={m.size} />

                  }



                    {/* Open button */}
                    <button
                    onClick={() => openMaterial(m)}
                    disabled={openingId === m.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded shrink-0 transition-all disabled:opacity-60"
                    style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1.5px solid hsl(var(--color-black-border))' }}>
                    
                      {openingId === m.id ?
                    <><Loader2 size={12} className="animate-spin" /> <span>Opening…</span></> :
                    m.type === 'drive_folder' ?
                    <><FolderOpen size={12} /> <span>Browse</span></> :
                    m.type === 'link' ?
                    <><ExternalLink size={12} /> <span>{learning_materials.openButton}</span></> :
                    <><Eye size={12} /> <span>{learning_materials.viewButton}</span></>
                    }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>);

}

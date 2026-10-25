import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useSession } from '@/lib/auth/auth-client';
import AppShell from '@/components/app/AppShell';
import { admin_allowed_emails } from 'virtual:content';
import { Loader2, Plus, Trash2, Pencil, X, Check, ShieldAlert, Mail, Calendar, User, StickyNote } from 'lucide-react';

const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

interface AllowedEmail {
  id: string;
  email: string;
  addedAt: string;
  addedBy: string | null;
  note: string | null;
}

const inputStyle: React.CSSProperties = {
  border: '2px solid hsl(var(--color-gold) / 0.5)',
  transition: 'border-color 0.15s',
};
const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'hsl(var(--color-gold))';
};
const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'hsl(var(--color-gold) / 0.5)';
};

const tapeBg = `repeating-linear-gradient(45deg,hsl(var(--color-gold)) 0,hsl(var(--color-gold)) 10px,hsl(var(--color-charcoal)) 10px,hsl(var(--color-charcoal)) 20px)`;

// ── Modal shell ──────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'hsl(var(--overlay-dark) / 0.75)' }}
    >
      <div
        className="w-full max-w-md rounded-xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '3px solid hsl(var(--color-gold))' }}
      >
        <div style={{ height: 6, background: tapeBg }} />
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <h2
            className="text-base font-black uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-gold))' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Add Modal ────────────────────────────────────────────────────────────────
type PlanType = 'monthly' | 'quarterly' | 'yearly' | 'custom';

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [planType, setPlanType] = useState<PlanType>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/allowed-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, note, planType, startDate }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? admin_allowed_emails.networkError); return; }
      onAdded();
      onClose();
    } catch {
      setError(admin_allowed_emails.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add Email to Allowlist" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {admin_allowed_emails.addEmailLabel}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={admin_allowed_emails.addEmailPlaceholder}
            className="w-full px-3 py-2 rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span>{admin_allowed_emails.addNotesLabel}</span>{' '}
            <span className="normal-case font-normal">{admin_allowed_emails.addNotesOptional}</span>
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={admin_allowed_emails.addNotesPlaceholder}
            className="w-full px-3 py-2 rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        {/* Plan type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Plan Type *</label>
          <select required value={planType} onChange={e => setPlanType(e.target.value as PlanType)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ ...inputStyle, background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-input-text))' }}>
            <option value="monthly">Monthly (1 month)</option>
            <option value="quarterly">Quarterly (3 months)</option>
            <option value="yearly">Year-long (12 months)</option>
            <option value="custom">Custom (set expiry manually later)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Access Start Date *</label>
          <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            style={{ ...inputStyle, background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-input-text))', colorScheme: 'dark' }} />
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            {admin_allowed_emails.addCancelButton}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold flex-1 py-2 rounded-lg text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            <span>{admin_allowed_emails.addSubmitButton}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ entry, onClose, onSaved }: { entry: AllowedEmail; onClose: () => void; onSaved: () => void }) {
  const [note, setNote] = useState(entry.note ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/allowed-emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: entry.email, note }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? admin_allowed_emails.networkError); return; }
      onSaved();
      onClose();
    } catch {
      setError(admin_allowed_emails.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Edit Notes" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {admin_allowed_emails.editEmailLabel}
          </p>
          <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-gold))' }}>{entry.email}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {admin_allowed_emails.editNotesLabel}
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={admin_allowed_emails.addNotesPlaceholder}
            className="w-full px-3 py-2 rounded-lg text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
            style={inputStyle}
            onFocus={inputFocus}
            onBlur={inputBlur}
          />
        </div>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            {admin_allowed_emails.editCancelButton}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-gold flex-1 py-2 rounded-lg text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>{admin_allowed_emails.editSaveButton}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ email, onClose, onDeleted }: { email: string; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/allowed-emails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? admin_allowed_emails.networkError); return; }
      onDeleted();
      onClose();
    } catch {
      setError(admin_allowed_emails.networkError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Remove from Allowlist" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <span>{admin_allowed_emails.deleteConfirmPrefix} </span>
          <strong style={{ color: 'hsl(var(--color-gold))' }}>{email}</strong>
          <span> {admin_allowed_emails.deleteConfirmSuffix}</span>
        </p>
        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border-2 border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            {admin_allowed_emails.deleteCancelButton}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-sm font-black uppercase tracking-wide flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{
              background: 'hsl(var(--destructive))',
              color: 'hsl(var(--destructive-foreground))',
              border: '3px solid hsl(var(--color-charcoal))',
            }}
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            <span>{admin_allowed_emails.deleteConfirmButton}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAllowedEmailsPage() {
  const { data: session, isPending } = useSession();
  const [entries, setEntries] = useState<AllowedEmail[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editEntry, setEditEntry] = useState<AllowedEmail | null>(null);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoadingData(true);
    setFetchError('');
    try {
      const res = await fetch('/api/admin/allowed-emails');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json() as AllowedEmail[];
      setEntries(data);
    } catch {
      setFetchError(admin_allowed_emails.fetchError);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.email === ADMIN_EMAIL) {
      fetchEntries();
    }
  }, [session, fetchEntries]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'hsl(var(--color-gold))' }} />
      </div>
    );
  }
  if (!session?.user) return <Navigate to="/login" replace />;
  if (session.user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  const filtered = entries.filter(e =>
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    (e.note ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (e.addedBy ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <>
      <Helmet>
        <title>{admin_allowed_emails.pageTitle}</title>
        <meta name="description" content={admin_allowed_emails.pageDescription} />
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <AppShell activeSection="admin">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert size={18} style={{ color: 'hsl(var(--color-gold))' }} />
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {admin_allowed_emails.adminBadge}
                </span>
              </div>
              <h1
                className="text-3xl font-black uppercase tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-gold))' }}
              >
                {admin_allowed_emails.heading}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {admin_allowed_emails.subheading}
              </p>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-black uppercase tracking-wide shrink-0"
            >
              <Plus size={16} />
              <span>{admin_allowed_emails.addButton}</span>
            </button>
          </div>

          {/* Stats bar */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-xl"
            style={{ background: 'hsl(var(--card))', border: '2px solid hsl(var(--color-gold) / 0.3)' }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {admin_allowed_emails.statsTotal}
              </span>
              <span className="text-2xl font-black" style={{ color: 'hsl(var(--color-gold))' }}>{entries.length}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {admin_allowed_emails.statsNotes}
              </span>
              <span className="text-2xl font-black text-foreground">{entries.filter(e => e.note).length}</span>
            </div>
            <div className="flex flex-col gap-0.5 col-span-2 sm:col-span-1">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {admin_allowed_emails.statsShowing}
              </span>
              <span className="text-2xl font-black text-foreground">{filtered.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={admin_allowed_emails.searchPlaceholder}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none"
              style={{ border: '2px solid hsl(var(--color-gold) / 0.4)', transition: 'border-color 0.15s' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'hsl(var(--color-gold))')}
              onBlur={e => (e.currentTarget.style.borderColor = 'hsl(var(--color-gold) / 0.4)')}
            />
          </div>

          {/* Table */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '2px solid hsl(var(--color-gold) / 0.4)', background: 'hsl(var(--card))' }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest"
              style={{
                background: 'hsl(var(--color-gold) / 0.12)',
                borderBottom: '2px solid hsl(var(--color-gold) / 0.3)',
                color: 'hsl(var(--color-gold))',
              }}
            >
              <div className="col-span-4 flex items-center gap-1.5"><Mail size={12} /><span>{admin_allowed_emails.colEmail}</span></div>
              <div className="col-span-2 hidden sm:flex items-center gap-1.5"><Calendar size={12} /><span>{admin_allowed_emails.colAdded}</span></div>
              <div className="col-span-2 hidden md:flex items-center gap-1.5"><User size={12} /><span>{admin_allowed_emails.colAddedBy}</span></div>
              <div className="col-span-3 hidden sm:flex items-center gap-1.5"><StickyNote size={12} /><span>{admin_allowed_emails.colNotes}</span></div>
              <div className="col-span-8 sm:col-span-1 flex justify-end"><span>{admin_allowed_emails.colActions}</span></div>
            </div>

            {/* Body */}
            {loadingData ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 size={20} className="animate-spin" style={{ color: 'hsl(var(--color-gold))' }} />
                <span className="text-sm text-muted-foreground">{admin_allowed_emails.loadingText}</span>
              </div>
            ) : fetchError ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-sm text-red-400">{fetchError}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Mail size={32} className="text-muted-foreground opacity-40" />
                <p className="text-sm text-muted-foreground">
                  {search ? admin_allowed_emails.emptySearch : admin_allowed_emails.emptyList}
                </p>
              </div>
            ) : (
              filtered.map((entry, i) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm transition-colors hover:bg-muted/30"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}
                >
                  <div
                    className="col-span-4 font-medium truncate"
                    style={{ color: 'hsl(var(--color-gold))' }}
                    title={entry.email}
                  >
                    {entry.email}
                  </div>
                  <div className="col-span-2 hidden sm:block text-xs text-muted-foreground">
                    {formatDate(entry.addedAt)}
                  </div>
                  <div className="col-span-2 hidden md:block text-xs text-muted-foreground truncate" title={entry.addedBy ?? ''}>
                    {entry.addedBy ?? <span className="opacity-40">—</span>}
                  </div>
                  <div className="col-span-3 hidden sm:block text-xs text-muted-foreground truncate" title={entry.note ?? ''}>
                    {entry.note ? entry.note : <span className="opacity-40">—</span>}
                  </div>
                  <div className="col-span-8 sm:col-span-1 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditEntry(entry)}
                      className="p-1.5 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit notes"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteEmail(entry.email)}
                      className="p-1.5 rounded-md transition-colors text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                      title="Remove from allowlist"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-muted-foreground text-center mt-6 opacity-60">
            <span>{admin_allowed_emails.footerNote}</span>
            <span> · Admin: {ADMIN_EMAIL}</span>
          </p>
        </div>
      </AppShell>

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onAdded={fetchEntries} />}
      {editEntry && <EditModal entry={editEntry} onClose={() => setEditEntry(null)} onSaved={fetchEntries} />}
      {deleteEmail && <DeleteModal email={deleteEmail} onClose={() => setDeleteEmail(null)} onDeleted={fetchEntries} />}
    </>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle, ChevronDown, ChevronUp, Check, X, History, Users } from 'lucide-react';

export type PlanType = 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type AccessStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'pending';

export interface AccessRecord {
  id: string;
  userId: string;
  planType: PlanType;
  startDate: string | null;
  expiryDate: string | null;
  status: string;
  liveStatus: AccessStatus;
  daysRemaining: number | null;
  adminNotes: string | null;
}

export interface AuditEntry {
  id: string;
  userId: string;
  changedBy: string;
  action: string;
  oldPlan: string | null;
  newPlan: string | null;
  oldExpiry: string | null;
  newExpiry: string | null;
  oldStatus: string | null;
  newStatus: string | null;
  notes: string | null;
  createdAt: string;
}

export interface UserWithAccess {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  access: AccessRecord | null;
}

const PLAN_LABELS: Record<PlanType, string> = {
  monthly: 'Monthly (1 mo)',
  quarterly: 'Quarterly (3 mo)',
  yearly: 'Year-long (12 mo)',
  custom: 'Custom',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  active:        { bg: 'hsl(142 71% 45% / 0.15)', text: 'hsl(142 71% 45%)', label: 'Active' },
  expiring_soon: { bg: 'hsl(38 92% 50% / 0.15)',  text: 'hsl(38 92% 50%)',  label: 'Expiring Soon' },
  expired:       { bg: 'hsl(0 72% 51% / 0.15)',   text: 'hsl(0 72% 51%)',   label: 'Expired' },
  suspended:     { bg: 'hsl(0 0% 50% / 0.15)',    text: 'hsl(0 0% 60%)',    label: 'Suspended' },
  pending:       { bg: 'hsl(220 60% 60% / 0.15)', text: 'hsl(220 60% 70%)', label: 'Pending' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}40` }}>
      {s.label}
    </span>
  );
}

function inputCls() {
  return 'w-full px-3 py-2 rounded text-xs outline-none';
}
function inputSty(): React.CSSProperties {
  return { background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.4)', color: 'hsl(var(--color-input-text))', colorScheme: 'dark' };
}

// ── Edit Access Modal ────────────────────────────────────────────────────────
function EditAccessModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserWithAccess;
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = user.access;
  const [planType, setPlanType] = useState<PlanType>(existing?.planType ?? 'monthly');
  const [startDate, setStartDate] = useState(existing?.startDate ?? new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(existing?.expiryDate ?? '');
  const [adminNotes, setAdminNotes] = useState(existing?.adminNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/access/audit/${user.id}`)
      .then(r => r.json())
      .then(setAuditLog)
      .catch(() => {});
  }, [user.id]);

  // Auto-compute expiry when plan changes (unless custom)
  useEffect(() => {
    if (planType === 'custom') return;
    const months = planType === 'monthly' ? 1 : planType === 'quarterly' ? 3 : 12;
    const base = startDate || new Date().toISOString().slice(0, 10);
    const d = new Date(base + 'T00:00:00Z');
    d.setUTCMonth(d.getUTCMonth() + months);
    setExpiryDate(d.toISOString().slice(0, 10));
  }, [planType, startDate]);

  const doAction = async (action: string) => {
    setSaving(true);
    try {
      await fetch(`/api/admin/access/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/admin/access/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, startDate, expiryDate: expiryDate || null, adminNotes }),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const tapeBg = `repeating-linear-gradient(45deg,hsl(var(--color-gold)) 0,hsl(var(--color-gold)) 10px,hsl(var(--color-charcoal)) 10px,hsl(var(--color-charcoal)) 20px)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-xl overflow-hidden max-h-[90vh] overflow-y-auto" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))' }}>
        <div style={{ height: 6, background: tapeBg }} />
        <div className="flex items-center justify-between px-5 py-3" style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
          <h2 className="font-black uppercase text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>
            🔑 Edit Access — {user.name ?? user.email}
          </h2>
          <button onClick={onClose} style={{ color: 'hsl(var(--color-black-border))' }}><X size={16} /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current status */}
          {existing && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '1.5px solid hsl(var(--color-gold) / 0.3)' }}>
              <StatusBadge status={existing.liveStatus} />
              {existing.expiryDate && (
                <span className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>
                  Expires: <strong style={{ color: 'hsl(var(--color-body-text))' }}>{existing.expiryDate}</strong>
                  {existing.daysRemaining !== null && (
                    <span> ({existing.daysRemaining > 0 ? `${existing.daysRemaining}d left` : 'expired'})</span>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Plan */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>Plan Type</label>
            <select value={planType} onChange={e => setPlanType(e.target.value as PlanType)} className={inputCls()} style={inputSty()}>
              {(Object.entries(PLAN_LABELS) as [PlanType, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>Start Date (PHT)</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls()} style={inputSty()} />
          </div>

          {/* Expiry date */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>
              Expiry Date (PHT) — access ends at 11:59 PM on this date
            </label>
            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputCls()} style={inputSty()} />
          </div>

          {/* Quick extend */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>Quick Extend (from current expiry or today)</label>
            <div className="flex gap-2 flex-wrap">
              {[['extend_1m', '+1 Month'], ['extend_3m', '+3 Months'], ['extend_1y', '+1 Year']].map(([act, lbl]) => (
                <button key={act} onClick={() => doAction(act)} disabled={saving}
                  className="px-3 py-1.5 text-xs font-bold uppercase rounded"
                  style={{ background: 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-gold))', border: '2px solid hsl(var(--color-gold) / 0.5)' }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Admin notes */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: 'hsl(var(--color-body-muted))' }}>Admin Notes</label>
            <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} placeholder="e.g. Paid via GCash, ref #1234" className={inputCls()} style={{ ...inputSty(), resize: 'vertical' }} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1" style={{ borderTop: '2px dashed hsl(var(--color-divider-cream))' }}>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded"
              style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2px solid hsl(var(--color-black-border))', boxShadow: '2px 2px 0 hsl(var(--color-black-border))' }}>
              <Check size={12} /> {saving ? 'Saving…' : 'Save Access'}
            </button>
            {existing?.liveStatus !== 'suspended' ? (
              <button onClick={() => doAction('suspend')} disabled={saving}
                className="px-3 py-2 text-xs font-bold uppercase rounded"
                style={{ color: 'hsl(var(--color-danger))', border: '2px solid hsl(var(--color-danger))' }}>
                Suspend
              </button>
            ) : (
              <button onClick={() => doAction('reactivate')} disabled={saving}
                className="px-3 py-2 text-xs font-bold uppercase rounded"
                style={{ color: 'hsl(142 71% 45%)', border: '2px solid hsl(142 71% 45%)' }}>
                Reactivate
              </button>
            )}
            <button onClick={() => { if (confirm('Revoke access immediately? This expires the account now.')) doAction('revoke'); }} disabled={saving}
              className="px-3 py-2 text-xs font-bold uppercase rounded"
              style={{ color: 'hsl(var(--color-danger))', border: '2px solid hsl(var(--color-danger) / 0.5)' }}>
              Revoke
            </button>
          </div>

          {/* Audit log */}
          <div>
            <button onClick={() => setShowAudit(v => !v)} className="flex items-center gap-1.5 text-xs font-bold uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>
              <History size={12} /> Audit Log ({auditLog.length})
              {showAudit ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showAudit && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {auditLog.length === 0 && <p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>No history yet.</p>}
                {auditLog.map(log => (
                  <div key={log.id} className="p-2 rounded text-[10px]" style={{ background: 'hsl(var(--color-navy-mid))', border: '1px solid hsl(var(--color-gold) / 0.2)' }}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold uppercase" style={{ color: 'hsl(var(--color-gold))' }}>{log.action}</span>
                      <span style={{ color: 'hsl(var(--color-body-muted))' }}>{new Date(log.createdAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}</span>
                    </div>
                    {(log.oldExpiry || log.newExpiry) && (
                      <div style={{ color: 'hsl(var(--color-body-muted))' }}>
                        Expiry: {log.oldExpiry ?? '—'} → {log.newExpiry ?? '—'}
                      </div>
                    )}
                    {(log.oldPlan || log.newPlan) && (
                      <div style={{ color: 'hsl(var(--color-body-muted))' }}>
                        Plan: {log.oldPlan ?? '—'} → {log.newPlan ?? '—'}
                      </div>
                    )}
                    <div style={{ color: 'hsl(var(--color-body-muted))' }}>by {log.changedBy}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Access Management Panel ─────────────────────────────────────────────
export default function AccessManagement() {
  const [users, setUsers] = useState<UserWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | AccessStatus>('all');
  const [sortByExpiry, setSortByExpiry] = useState(false);
  const [editUser, setEditUser] = useState<UserWithAccess | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulkExpiry, setBulkExpiry] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const [expiringList, setExpiringList] = useState<(AccessRecord & { userName: string; userEmail: string })[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch users from existing endpoint
      const [usersRes, expiringRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/access/expiring-soon'),
      ]);
      const usersData = usersRes.ok ? await usersRes.json() : [];
      const expiringData = expiringRes.ok ? await expiringRes.json() : [];
      setExpiringList(expiringData);

      // Enrich each user with their access record
      const enriched: UserWithAccess[] = await Promise.all(
        (usersData as { id: string; name: string | null; email: string; createdAt: string }[]).map(async (u) => {
          try {
            const r = await fetch(`/api/admin/access/${u.id}`);
            const d = r.ok ? await r.json() : { access: null };
            return { ...u, access: d.access ?? null };
          } catch {
            return { ...u, access: null };
          }
        })
      );
      setUsers(enriched);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter(u => {
    if (filter === 'all') return true;
    const s = u.access?.liveStatus ?? 'pending';
    return s === filter;
  });

  const sorted = sortByExpiry
    ? [...filtered].sort((a, b) => {
        const ae = a.access?.expiryDate ?? '9999';
        const be = b.access?.expiryDate ?? '9999';
        return ae.localeCompare(be);
      })
    : filtered;

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    setBulkSaving(true);
    try {
      const body: Record<string, unknown> = { userIds: Array.from(selected), action: bulkAction };
      if (bulkAction === 'set_expiry') body.expiryDate = bulkExpiry;
      if (bulkAction === 'extend') body.months = 1;
      await fetch('/api/admin/access/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setSelected(new Set());
      setBulkAction('');
      await load();
    } finally {
      setBulkSaving(false);
    }
  };

  const FILTER_TABS: { id: 'all' | AccessStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'expiring_soon', label: 'Expiring Soon' },
    { id: 'expired', label: 'Expired' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'pending', label: 'Pending' },
  ];

  return (
    <div className="space-y-4">
      {/* Expiring Soon alert */}
      {expiringList.length > 0 && (
        <div style={{ background: 'hsl(38 92% 50% / 0.1)', border: '2px solid hsl(38 92% 50% / 0.5)', borderRadius: 8, padding: '12px 16px' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: 'hsl(38 92% 50%)' }} />
            <span className="text-xs font-black uppercase" style={{ color: 'hsl(38 92% 50%)' }}>
              {expiringList.length} student{expiringList.length > 1 ? 's' : ''} expiring within 7 days
            </span>
          </div>
          <div className="space-y-1">
            {expiringList.map(e => (
              <div key={e.userId} className="flex items-center justify-between gap-2 text-xs" style={{ color: 'hsl(var(--color-body-text))' }}>
                <span>{e.userName} ({e.userEmail})</span>
                <span style={{ color: 'hsl(38 92% 50%)' }}>{e.daysRemaining}d left · {e.expiryDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs + sort */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="px-3 py-1 text-[10px] font-bold uppercase rounded"
            style={{ background: filter === f.id ? 'hsl(var(--color-gold))' : 'hsl(var(--color-navy-mid))', color: filter === f.id ? 'hsl(var(--color-black-border))' : 'hsl(var(--color-body-muted))', border: '1.5px solid hsl(var(--color-black-border))' }}>
            {f.label}
          </button>
        ))}
        <button onClick={() => setSortByExpiry(v => !v)}
          className="flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase rounded ml-auto"
          style={{ background: sortByExpiry ? 'hsl(var(--color-gold) / 0.2)' : 'hsl(var(--color-navy-mid))', color: 'hsl(var(--color-body-muted))', border: '1.5px solid hsl(var(--color-gold) / 0.4)' }}>
          <Clock size={10} /> Sort by Expiry
        </button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.4)' }}>
          <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-gold))' }}>{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="px-2 py-1 text-xs rounded" style={{ background: 'hsl(var(--color-navy))', color: 'hsl(var(--color-input-text))', border: '1.5px solid hsl(var(--color-gold) / 0.4)' }}>
            <option value="">Choose action…</option>
            <option value="extend">+1 Month</option>
            <option value="set_expiry">Set Expiry Date</option>
            <option value="suspend">Suspend All</option>
            <option value="reactivate">Reactivate All</option>
          </select>
          {bulkAction === 'set_expiry' && (
            <input type="date" value={bulkExpiry} onChange={e => setBulkExpiry(e.target.value)} className="px-2 py-1 text-xs rounded" style={{ background: 'hsl(var(--color-navy))', color: 'hsl(var(--color-input-text))', border: '1.5px solid hsl(var(--color-gold) / 0.4)', colorScheme: 'dark' }} />
          )}
          <button onClick={handleBulk} disabled={bulkSaving || !bulkAction}
            className="px-3 py-1 text-xs font-bold uppercase rounded"
            style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2px solid hsl(var(--color-black-border))' }}>
            {bulkSaving ? '…' : 'Apply'}
          </button>
          <button onClick={() => setSelected(new Set())} className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>Clear</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-8 text-center text-sm" style={{ color: 'hsl(var(--color-body-muted))' }}>Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="py-8 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
          <Users size={24} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No students found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--color-divider-cream))' }}>
                <th className="py-2 px-2 text-left w-6">
                  <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(sorted.map(u => u.id)) : new Set())} checked={selected.size === sorted.length && sorted.length > 0} />
                </th>
                {['Student', 'Plan', 'Start', 'Expiry', 'Days Left', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-2 px-2 text-left font-black uppercase tracking-wide" style={{ color: 'hsl(var(--color-body-muted))' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(u => {
                const acc = u.access;
                const status = acc?.liveStatus ?? 'pending';
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid hsl(var(--color-divider-cream))' }}>
                    <td className="py-2 px-2">
                      <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} />
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{u.name ?? '—'}</div>
                      <div style={{ color: 'hsl(var(--color-body-muted))' }}>{u.email}</div>
                    </td>
                    <td className="py-2 px-2" style={{ color: 'hsl(var(--color-body-muted))' }}>
                      {acc ? PLAN_LABELS[acc.planType] ?? acc.planType : '—'}
                    </td>
                    <td className="py-2 px-2" style={{ color: 'hsl(var(--color-body-muted))' }}>{acc?.startDate ?? '—'}</td>
                    <td className="py-2 px-2" style={{ color: 'hsl(var(--color-body-muted))' }}>{acc?.expiryDate ?? '—'}</td>
                    <td className="py-2 px-2" style={{ color: acc?.daysRemaining !== null && acc?.daysRemaining !== undefined && acc?.daysRemaining <= 7 ? 'hsl(38 92% 50%)' : 'hsl(var(--color-body-muted))' }}>
                      {acc?.daysRemaining !== null && acc?.daysRemaining !== undefined ? `${acc.daysRemaining}d` : '—'}
                    </td>
                    <td className="py-2 px-2"><StatusBadge status={status} /></td>
                    <td className="py-2 px-2">
                      <button onClick={() => setEditUser(u)}
                        className="px-2 py-1 text-[10px] font-bold uppercase rounded"
                        style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1.5px solid hsl(var(--color-black-border))' }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editUser && (
        <EditAccessModal user={editUser} onClose={() => setEditUser(null)} onSaved={load} />
      )}
    </div>
  );
}

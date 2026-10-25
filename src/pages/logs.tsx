import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Plus, Edit2, Trash2, X, Save, Camera, Clock, Calendar } from 'lucide-react';
import AppShell from '@/components/app/AppShell';

type Subject = 'Developmental Psychology' | 'Psychological Assessment' | 'I/O Psychology' | 'Abnormal Psychology';

interface StudyLog {
  id: string;
  subject: Subject;
  hours: number;
  date: string;
  notes: string;
  proofUrl: string;
}

const SUBJECTS: Subject[] = [
'Developmental Psychology',
'Psychological Assessment',
'I/O Psychology',
'Abnormal Psychology'];


const SUBJECT_COLORS: Record<Subject, string> = {
  'Developmental Psychology': 'hsl(var(--color-gold))',
  'Psychological Assessment': '#60a5fa',
  'I/O Psychology': '#34d399',
  'Abnormal Psychology': '#a78bfa'
};

const SUBJECT_EMOJIS: Record<Subject, string> = {
  'Developmental Psychology': '🌱',
  'Psychological Assessment': '📊',
  'I/O Psychology': '🏢',
  'Abnormal Psychology': '🧠'
};

function SectionCard({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(222 50% 16% / 0.12)', borderRadius: '14px', boxShadow: '0 1px 2px hsl(222 50% 16% / 0.06), 0 8px 24px -12px hsl(222 50% 16% / 0.15)', overflow: 'hidden' }}>
      <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(222 50% 16% / 0.10)' }}>
        <h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>);

}

export default function LogsPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<StudyLog | null>(null);
  const [subject, setSubject] = useState<Subject>('Abnormal Psychology');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofError, setProofError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const authHeader = (): HeadersInit => {
    const token = localStorage.getItem('atrc_session_token') ?? '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/study-logs', { headers: authHeader() });
      if (!res.ok) return;
      const data = await res.json() as { logs: Array<{ id: string; subject: string; hours: string; date: string; notes: string | null; proofUrl: string | null }> };
      setLogs(data.logs.map((l) => ({
        id: l.id,
        subject: l.subject as Subject,
        hours: parseFloat(l.hours),
        date: l.date,
        notes: l.notes ?? '',
        proofUrl: l.proofUrl ?? '',
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalHours = logs.reduce((s, l) => s + l.hours, 0);
  const hoursPerSubject = SUBJECTS.map((s) => ({ subject: s, hours: logs.filter((l) => l.subject === s).reduce((a, l) => a + l.hours, 0) }));
  const streak = (() => {
    const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
    let count = 0;
    let cur = new Date();
    for (const d of dates) {
      const diff = Math.round((cur.getTime() - new Date(d).getTime()) / 86400000);
      if (diff <= 1) {count++;cur = new Date(d);} else break;
    }
    return count;
  })();
  const avgHours = logs.length > 0 ? (totalHours / [...new Set(logs.map((l) => l.date))].length).toFixed(1) : '0';

  const openAdd = () => {
    setEditingLog(null);
    setSubject('Abnormal Psychology');setHours('');setDate(new Date().toISOString().slice(0, 10));setNotes('');setProofUrl('');setProofFile(null);setProofError(false);
    setShowModal(true);
  };

  const openEdit = (log: StudyLog) => {
    setEditingLog(log);
    setSubject(log.subject);setHours(String(log.hours));setDate(log.date);setNotes(log.notes);setProofUrl(log.proofUrl);setProofFile(null);setProofError(false);
    setShowModal(true);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {setProofUrl(ev.target?.result as string);setProofError(false);};
    reader.readAsDataURL(file);
  };

  const saveLog = async () => {
    if (!proofFile && !editingLog?.proofUrl && !proofUrl) {setProofError(true);return;}
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('subject', subject);
      fd.append('hours', String(h));
      fd.append('date', date);
      fd.append('notes', notes);
      if (proofFile) fd.append('proof', proofFile);

      if (editingLog) {
        await fetch(`/api/study-logs/${editingLog.id}`, { method: 'PATCH', headers: authHeader(), body: fd });
      } else {
        await fetch('/api/study-logs', { method: 'POST', headers: authHeader(), body: fd });
      }
      await fetchLogs();
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    await fetch(`/api/study-logs/${id}`, { method: 'DELETE', headers: authHeader() });
    await fetchLogs();
  };

  return (
    <AppShell activeSection="logs">
      <Helmet>
        <title>WeBILIB Study Logs — ATRC Premium PMLeBoards</title>
        <meta name="description" content="Log your daily PMLE study sessions with proof-of-study photos. Track streaks, hours, and subject coverage across your 100-day review." />
        <link rel="canonical" href="https://atrcpremium.com/logs" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>📋 WeBILIB Logs</h1>

        {/* Aggregates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
          { label: 'Total Hours', value: totalHours.toFixed(1), emoji: '⏱️' },
          { label: 'Avg / Day', value: avgHours + 'h', emoji: '📈' },
          { label: 'Current Streak', value: streak + ' days', emoji: '🔥' },
          { label: 'Total Logs', value: String(logs.length), emoji: '📋' }].
          map((s) =>
          <div key={s.label} className="p-3 rounded" style={{ background: 'hsl(var(--color-card-cream))', border: '2.5px solid hsl(var(--color-black-border))', boxShadow: '3px 3px 0 hsl(var(--color-black-border))' }}>
              <div className="text-xl mb-1">{s.emoji}</div>
              <div className="text-lg font-black" style={{ fontFamily: 'var(--font-display)', color: "#2a3847" }}>{s.value}</div>
              <div className="text-[10px] font-bold uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>{s.label}</div>
            </div>
          )}
        </div>

        {/* Hours per subject */}
        <SectionCard title="📊 Log Aggregates Per Subject">
          <div className="space-y-3">
            {hoursPerSubject.map(({ subject: s, hours: h }) =>
            <div key={s}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{SUBJECT_EMOJIS[s]} {s}</span>
                  <span className="text-xs font-black" style={{ color: SUBJECT_COLORS[s] }}>{h.toFixed(1)}h</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--color-navy-mid))' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: totalHours > 0 ? `${h / totalHours * 100}%` : '0%', background: SUBJECT_COLORS[s] }} />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Log list */}
        <SectionCard title="📋 Study Logs">
          <div className="flex justify-end mb-3">
            <button onClick={openAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Plus size={13} /> Add Log</button>
          </div>
          {loading ?
          <div className="text-center py-8" style={{ color: 'hsl(var(--color-body-muted))' }}>
              <p className="text-sm font-bold animate-pulse">Loading logs…</p>
            </div> :
          logs.length === 0 ?
          <div className="text-center py-8" style={{ color: 'hsl(var(--color-body-muted))' }}>
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm font-bold">No logs yet. Start logging your study sessions!</p>
            </div> :

          <div className="space-y-2">
              {logs.map((log) =>
            <div key={log.id} className="flex items-start gap-3 p-3 rounded" style={{ border: '2px solid hsl(var(--color-divider-cream))' }}>
                  <div className="shrink-0 w-1 self-stretch rounded-full" style={{ background: SUBJECT_COLORS[log.subject] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-black uppercase" style={{ color: SUBJECT_COLORS[log.subject] }}>{SUBJECT_EMOJIS[log.subject]} {log.subject}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {log.hours}h</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {log.date}</span>
                      {log.proofUrl && <span className="flex items-center gap-1"><Camera size={11} /> Proof attached</span>}
                    </div>
                    {log.notes && <p className="text-xs mt-1 truncate" style={{ color: 'hsl(var(--color-body-muted))' }}>{log.notes}</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEdit(log)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-sidebar-text))' }}><Edit2 size={13} /></button>
                    <button onClick={() => deleteLog(log.id)} className="p-1.5 rounded" style={{ color: '#f87171' }}><Trash2 size={13} /></button>
                  </div>
                </div>
            )}
            </div>
          }
        </SectionCard>
      </div>

      {/* Log Modal */}
      {showModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-md p-5 rounded-xl overflow-y-auto max-h-[90vh]" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase text-sm" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{editingLog ? 'Edit Log' : 'Add Study Log'}</h3>
              <button onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Core Subject</label>
                <select value={subject} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubject(e.target.value as Subject)} className="w-full px-3 py-2 text-sm rounded outline-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }}>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Hours Logged</label>
                  <input type="number" min="0.5" max="24" step="0.5" value={hours} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHours(e.target.value)} placeholder="e.g. 2.5" className="w-full px-3 py-2 text-sm rounded outline-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Date</label>
                  <input type="date" value={date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded outline-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Notes</label>
                <textarea value={notes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)} rows={2} placeholder="What did you study?" className="w-full px-3 py-2 text-sm rounded outline-none resize-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>
                  Proof of Study <span style={{ color: '#f87171' }}>*</span>
                </label>
                <div
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded cursor-pointer transition-colors hover:bg-black/5"
                style={{ border: `2px dashed ${proofError ? '#f87171' : 'hsl(var(--color-input-border))'}` }}>
                
                  {proofUrl ?
                <img src={proofUrl} alt="proof" className="max-h-32 rounded object-contain" /> :

                <>
                      <Camera size={24} style={{ color: 'hsl(var(--color-sidebar-text))' }} />
                      <p className="text-xs text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>Click or drag & drop a photo<br />(study area, notes, screenshot)</p>
                    </>
                }
                </div>
                {proofError && <p className="text-xs mt-1" style={{ color: '#f87171' }}>Proof of study is required.</p>}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {editingLog && <button onClick={() => {deleteLog(editingLog.id);setShowModal(false);}} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ color: '#f87171', border: '2px solid #f87171' }}><Trash2 size={12} /> Delete</button>}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}>Cancel</button>
                <button onClick={() => { void saveLog(); }} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded disabled:opacity-60" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Save size={12} /> {saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      }
    </AppShell>);

}
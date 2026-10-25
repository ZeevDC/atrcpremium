import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Plus, Edit2, Trash2, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import AppShell from '@/components/app/AppShell';

type TabId = 'calendar' | 'mood';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  color: string;
}

interface MoodEntry {
  id: string;
  date: string;
  emoji: string;
  label: string;
  notes: string;
}

const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Great' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😔', label: 'Low' },
  { emoji: '😤', label: 'Stressed' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🔥', label: 'Motivated' },
  { emoji: '😰', label: 'Anxious' },
];

const EVENT_COLORS = ['hsl(var(--color-gold))', '#60a5fa', '#a78bfa', '#34d399', '#f87171', '#fb923c'];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(222 50% 16% / 0.12)', borderRadius: '14px', boxShadow: '0 1px 2px hsl(222 50% 16% / 0.06), 0 8px 24px -12px hsl(222 50% 16% / 0.15)', overflow: 'hidden' }}>
      <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(222 50% 16% / 0.10)' }}>
        <h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function StudyPlannerPage() {
  const [tab, setTab] = useState<TabId>('calendar');
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(EVENT_COLORS[0]);

  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [editingMood, setEditingMood] = useState<MoodEntry | null>(null);
  const [moodDate, setMoodDate] = useState(today.toISOString().slice(0,10));
  const [moodEmoji, setMoodEmoji] = useState('😄');
  const [moodLabel, setMoodLabel] = useState('Great');
  const [moodNotes, setMoodNotes] = useState('');

  // Calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  const getEventsForDay = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const openAddEvent = (day?: number) => {
    setEditingEvent(null);
    setNewEventDate(day ? `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}` : '');
    setNewEventTitle('');
    setNewEventColor(EVENT_COLORS[0]);
    setShowEventModal(true);
  };

  const openEditEvent = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setNewEventDate(ev.date);
    setNewEventTitle(ev.title);
    setNewEventColor(ev.color);
    setShowEventModal(true);
  };

  const saveEvent = () => {
    if (!newEventTitle.trim() || !newEventDate) return;
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, date: newEventDate, title: newEventTitle, color: newEventColor } : e));
    } else {
      setEvents(prev => [...prev, { id: Date.now().toString(), date: newEventDate, title: newEventTitle, color: newEventColor }]);
    }
    setShowEventModal(false);
  };

  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const openAddMood = () => {
    setEditingMood(null);
    setMoodDate(today.toISOString().slice(0,10));
    setMoodEmoji('😄'); setMoodLabel('Great'); setMoodNotes('');
    setShowMoodModal(true);
  };

  const openEditMood = (m: MoodEntry) => {
    setEditingMood(m);
    setMoodDate(m.date); setMoodEmoji(m.emoji); setMoodLabel(m.label); setMoodNotes(m.notes);
    setShowMoodModal(true);
  };

  const saveMood = () => {
    if (editingMood) {
      setMoods(prev => prev.map(m => m.id === editingMood.id ? { ...m, date: moodDate, emoji: moodEmoji, label: moodLabel, notes: moodNotes } : m));
    } else {
      setMoods(prev => [...prev, { id: Date.now().toString(), date: moodDate, emoji: moodEmoji, label: moodLabel, notes: moodNotes }]);
    }
    setShowMoodModal(false);
  };

  const deleteMood = (id: string) => setMoods(prev => prev.filter(m => m.id !== id));

  return (
    <AppShell activeSection="study-planner">
      <Helmet>
        <title>Study Planner — ATRC Premium PMLeBoards</title>
        <meta name="description" content="Plan your PMLE study schedule, set daily goals, and track your mood throughout your 100-day board exam preparation journey." />
        <link rel="canonical" href="https://atrcpremium.com/study-planner" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>📅 Study Planner</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['calendar', 'mood'] as TabId[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-4 py-2 text-xs font-semibold rounded-full transition-all" style={{ background: tab === t ? 'hsl(var(--color-navy))' : 'transparent', color: tab === t ? 'hsl(var(--color-page-bg))' : 'hsl(var(--color-body-muted))', border: tab === t ? '1.5px solid hsl(var(--color-navy))' : '1.5px solid hsl(var(--color-hairline-strong))', boxShadow: tab === t ? '0 1px 4px hsl(var(--color-navy) / 0.18)' : 'none' }}>
              {t === 'calendar' ? '📆 Calendar' : '😊 Mood Tracker'}
            </button>
          ))}
        </div>

        {tab === 'calendar' && (
          <SectionCard title="📆 Calendar">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); } else setViewMonth(m => m-1); }} className="p-1.5 rounded" style={{ border: '2px solid hsl(var(--color-black-border))' }}><ChevronLeft size={14} /></button>
              <span className="font-black uppercase text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-body-text))' }}>{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); } else setViewMonth(m => m+1); }} className="p-1.5 rounded" style={{ border: '2px solid hsl(var(--color-black-border))' }}><ChevronRight size={14} /></button>
            </div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => <div key={d} className="text-center text-[10px] font-black uppercase py-1" style={{ color: 'hsl(var(--color-body-muted))' }}>{d}</div>)}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((day, i) => {
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div key={i} onClick={() => day && openAddEvent(day)} className="min-h-[52px] p-1 rounded cursor-pointer transition-colors hover:bg-black/5" style={{ background: isToday ? 'hsl(var(--color-gold) / 0.15)' : 'transparent', border: isToday ? '1.5px solid hsl(var(--color-gold))' : '1.5px solid transparent' }}>
                    {day && <>
                      <div className="text-[11px] font-bold mb-0.5" style={{ color: isToday ? 'hsl(var(--color-gold))' : 'hsl(var(--color-body-text))' }}>{day}</div>
                      {dayEvents.slice(0,2).map(ev => (
                        <div key={ev.id} onClick={(e: React.MouseEvent) => { e.stopPropagation(); openEditEvent(ev); }} className="text-[9px] font-bold truncate px-1 rounded mb-0.5" style={{ background: ev.color, color: 'hsl(var(--color-black-border))' }}>{ev.title}</div>
                      ))}
                      {dayEvents.length > 2 && <div className="text-[9px]" style={{ color: 'hsl(var(--color-body-muted))' }}>+{dayEvents.length - 2}</div>}
                    </>}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-3">
              <button onClick={() => openAddEvent()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Plus size={13} /> Add Event</button>
            </div>
          </SectionCard>
        )}

        {tab === 'mood' && (
          <SectionCard title="😊 Mood Tracker">
            <div className="flex justify-end mb-3">
              <button onClick={openAddMood} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full" style={{ background: 'hsl(var(--color-navy))', color: 'hsl(var(--color-page-bg))', border: '1.5px solid hsl(var(--color-navy))', boxShadow: '0 1px 4px hsl(var(--color-navy) / 0.18)' }}><Plus size={13} /> Log Mood</button>
            </div>
            {moods.length === 0 ? (
              <div className="text-center py-10" style={{ color: 'hsl(var(--color-body-muted))' }}>
                <div className="text-4xl mb-2">😊</div>
                <p className="text-sm font-bold">No mood entries yet.</p>
                <p className="text-xs">Click "Log Mood" to track how you're feeling today.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...moods].reverse().map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded" style={{ border: '2px solid hsl(var(--color-divider-cream))' }}>
                    <span className="text-2xl shrink-0">{m.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{m.label}</span>
                        <span className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>{m.date}</span>
                      </div>
                      {m.notes && <p className="text-xs truncate" style={{ color: 'hsl(var(--color-body-muted))' }}>{m.notes}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openEditMood(m)} className="p-1.5 rounded" style={{ color: 'hsl(var(--color-sidebar-text))' }}><Edit2 size={13} /></button>
                      <button onClick={() => deleteMood(m.id)} className="p-1.5 rounded" style={{ color: '#f87171' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowEventModal(false)}>
          <div className="w-full max-w-sm p-5 rounded-xl" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase text-sm" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{editingEvent ? 'Edit Event' : 'Add Event'}</h3>
              <button onClick={() => setShowEventModal(false)}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Date</label>
                <input type="date" value={newEventDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEventDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded outline-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Title</label>
                <input type="text" value={newEventTitle} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEventTitle(e.target.value)} placeholder="e.g. Study: Abnormal Psych" className="w-full px-3 py-2 text-sm rounded outline-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-2" style={{ color: 'hsl(var(--color-label))' }}>Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button key={c} onClick={() => setNewEventColor(c)} className="w-7 h-7 rounded-full transition-transform" style={{ background: c, border: newEventColor === c ? '3px solid hsl(var(--color-black-border))' : '2px solid transparent', transform: newEventColor === c ? 'scale(1.2)' : 'scale(1)' }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {editingEvent && <button onClick={() => { deleteEvent(editingEvent.id); setShowEventModal(false); }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ color: '#f87171', border: '2px solid #f87171' }}><Trash2 size={12} /> Delete</button>}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowEventModal(false)} className="px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}>Cancel</button>
                <button onClick={saveEvent} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Save size={12} /> Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowMoodModal(false)}>
          <div className="w-full max-w-sm p-5 rounded-xl" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase text-sm" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{editingMood ? 'Edit Mood' : 'Log Mood'}</h3>
              <button onClick={() => setShowMoodModal(false)}><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Date</label>
                <input type="date" value={moodDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMoodDate(e.target.value)} className="w-full px-3 py-2 text-sm rounded outline-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-2" style={{ color: 'hsl(var(--color-label))' }}>How are you feeling?</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m.emoji} onClick={() => { setMoodEmoji(m.emoji); setMoodLabel(m.label); }} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all" style={{ background: moodEmoji === m.emoji ? 'hsl(var(--color-gold) / 0.2)' : 'transparent', border: moodEmoji === m.emoji ? '2px solid hsl(var(--color-gold))' : '2px solid hsl(var(--color-divider-cream))' }}>
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[9px] font-bold uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black uppercase tracking-wide block mb-1" style={{ color: 'hsl(var(--color-label))' }}>Notes (optional)</label>
                <textarea value={moodNotes} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMoodNotes(e.target.value)} rows={2} placeholder="What's on your mind?" className="w-full px-3 py-2 text-sm rounded outline-none resize-none" style={{ border: '2px solid hsl(var(--color-input-border))', color: 'hsl(var(--color-input-text))', background: 'hsl(var(--color-card-cream))' }} />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {editingMood && <button onClick={() => { deleteMood(editingMood.id); setShowMoodModal(false); }} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ color: '#f87171', border: '2px solid #f87171' }}><Trash2 size={12} /> Delete</button>}
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setShowMoodModal(false)} className="px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}>Cancel</button>
                <button onClick={saveMood} className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase rounded" style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1px solid hsl(222 50% 16% / 0.20)', boxShadow: '0 1px 3px hsl(222 50% 16% / 0.12)' }}><Save size={12} /> Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

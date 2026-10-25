import { motion } from 'motion/react';

interface QuickActionGridProps {
  onLogClick: () => void;
  onSectionChange: (section: string) => void;
}

const actions = [
  { id: 'log', emoji: '📋', title: "Log Today's Session", desc: 'Track your hours, subjects, and session type', wide: true, accent: true },
  { id: 'leaderboard', emoji: '🏆', title: 'Leaderboard', desc: 'Live rankings', wide: false, accent: false },
  { id: 'mock-exam', emoji: '📝', title: 'Mock Exam Tracker', desc: 'Track your scores', wide: false, accent: false },
  { id: 'study-tools', emoji: '🛠️', title: 'Study Tools', desc: 'Pomodoro, timers', wide: false, accent: false },
  { id: 'daily-challenge', emoji: '🎯', title: 'Daily Challenge', desc: "Today's task", wide: false, accent: false },
  { id: 'community', emoji: '👥', title: 'Community', desc: "See who's studying", wide: false, accent: false },
];

export default function QuickActionGrid({ onLogClick, onSectionChange }: QuickActionGridProps) {
  const handleClick = (id: string) => {
    if (id === 'log') { onLogClick(); return; }
    onSectionChange(id);
  };

  return (
    <div>
      <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-3" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-gold))' }}>Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            onClick={() => handleClick(action.id)}
            className={[
              'rounded-xl border p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]',
              action.wide ? 'sm:col-span-2 md:col-span-2' : '',
            ].join(' ')}
            style={{
              background: action.accent ? 'hsl(var(--color-gold))' : 'hsl(var(--color-card-cream))',
              border: '2.5px solid hsl(0 0% 8%)',
              boxShadow: '4px 4px 0 hsl(0 0% 8%)',
              borderRadius: '8px',
            }}
          >
            <div className="text-2xl mb-2">{action.emoji}</div>
            <div
              className="font-bold text-sm mb-1"
              style={{ color: action.accent ? 'hsl(var(--color-gold))' : 'hsl(var(--foreground))' }}
            >
              {action.title}
            </div>
            <div className="text-xs text-muted-foreground">{action.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

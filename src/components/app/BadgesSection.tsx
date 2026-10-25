import { Medal } from 'lucide-react';

const badges = [
  { emoji: '🌱', name: 'Seedling', desc: 'Day 1 complete', earned: true },
  { emoji: '🔥', name: 'On Fire', desc: '7-day streak', earned: true },
  { emoji: '💪', name: 'Grinder', desc: '30 days logged', earned: true },
  { emoji: '📚', name: 'Bookworm', desc: '50 hrs studied', earned: true },
  { emoji: '🎯', name: 'Sharpshooter', desc: '85% mock score', earned: false },
  { emoji: '🏆', name: 'Topnotcher', desc: 'Complete 100 days', earned: false },
  { emoji: '⭐', name: 'Star Reviewer', desc: 'All subjects covered', earned: false },
  { emoji: '🦁', name: 'Lion Heart', desc: '60-day streak', earned: false },
];

export default function BadgesSection() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', borderRadius: '10px', boxShadow: '5px 5px 0 hsl(var(--color-black-border))' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
        <Medal size={18} style={{ color: 'hsl(var(--color-black-border))' }} />
        <h2 className="font-bold uppercase tracking-wide text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>Badge Collection</h2>
        <span className="ml-auto text-xs text-muted-foreground">4 / 8 earned</span>
      </div>
      <div className="p-5 grid grid-cols-4 sm:grid-cols-8 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all"
            style={{
              borderColor: badge.earned ? 'hsl(var(--color-black-border))' : 'hsl(47 40% 72%)',
              background: badge.earned ? 'hsl(var(--color-gold))' : 'hsl(55 60% 85%)',
              boxShadow: badge.earned ? '2px 2px 0 hsl(0 0% 8%)' : 'none',
              opacity: badge.earned ? 1 : 0.4,
            }}
            title={badge.desc}
          >
            <span className="text-2xl">{badge.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight" style={{ color: badge.earned ? 'hsl(var(--color-black-border))' : 'hsl(var(--color-text-muted))' }}>
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

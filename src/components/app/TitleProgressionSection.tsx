import { Award } from 'lucide-react';

const titles = [
  { level: 1, name: 'Aspiring Psychometrician', emoji: '🌱', days: 0, unlocked: true },
  { level: 2, name: 'Dedicated Reviewee', emoji: '📖', days: 10, unlocked: true },
  { level: 3, name: 'Consistent Scholar', emoji: '🎓', days: 25, unlocked: true },
  { level: 4, name: 'Focused Candidate', emoji: '🎯', days: 50, unlocked: false },
  { level: 5, name: 'Elite Reviewer', emoji: '⭐', days: 75, unlocked: false },
  { level: 6, name: 'Topnotcher', emoji: '🏆', days: 100, unlocked: false },
];

export default function TitleProgressionSection() {
  const currentLevel = 3;

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', borderRadius: '10px', boxShadow: '5px 5px 0 hsl(var(--color-black-border))' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
        <Award size={16} style={{ color: 'hsl(var(--color-black-border))' }} />
        <h2 className="font-bold uppercase tracking-wide text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>Title Progression</h2>
      </div>
      <div className="p-5">
        <div
          className="flex items-center gap-3 mb-5 p-3"
          style={{ background: 'hsl(var(--color-gold))', border: '2px solid hsl(var(--color-black-border))', borderRadius: '6px', boxShadow: '3px 3px 0 hsl(var(--color-black-border))' }}>
          <span className="text-3xl">🎓</span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--color-navy-mid))' }}>Current Title</div>
            <div className="font-black text-sm uppercase" style={{ color: 'hsl(var(--color-black-border))', fontFamily: 'var(--font-display)' }}>Consistent Scholar</div>
          </div>
        </div>
        <div className="space-y-2">
          {titles.map((title) => (
            <div
              key={title.level}
              className="flex items-center gap-3 p-3 rounded-xl border transition-all"
              style={{
                borderColor: title.level === currentLevel ? 'hsl(var(--color-black-border))' : 'hsl(47 40% 72%)',
                background: title.level === currentLevel ? 'hsl(47 100% 55% / 0.2)' : 'transparent',
                opacity: title.unlocked ? 1 : 0.5,
              }}
            >
              <span className="text-xl">{title.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: title.unlocked ? 'hsl(var(--color-navy-deep))' : 'hsl(var(--color-text-muted))' }}>
                  {title.name}
                </div>
                <div className="text-xs" style={{ color: 'hsl(var(--color-text-muted))' }}>Day {title.days}+</div>
              </div>
              {title.level === currentLevel && (
                <span className="text-[10px] px-2 py-0.5 font-black uppercase tracking-wide" style={{ background: 'hsl(var(--color-black-border))', color: 'hsl(var(--color-gold))', borderRadius: '3px' }}>Current</span>
              )}
              {title.unlocked && title.level !== currentLevel && (
                <span className="text-xs font-black" style={{ color: 'hsl(var(--success))' }}>✓</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Trophy, TrendingUp } from 'lucide-react';

const mockLeaders = [
  { rank: 1, name: 'Maria Santos', username: 'topnotcher_maria', days: 98, streak: 45, badge: '🥇', score: 9850 },
  { rank: 2, name: 'Juan dela Cruz', username: 'juandc2026', days: 95, streak: 40, badge: '🥈', score: 9500 },
  { rank: 3, name: 'Ana Reyes', username: 'ana_rpm', days: 92, streak: 38, badge: '🥉', score: 9200 },
  { rank: 4, name: 'Carlo Mendoza', username: 'carlo_pmle', days: 89, streak: 35, badge: '🎖️', score: 8900 },
  { rank: 5, name: 'Liza Bautista', username: 'liza_b', days: 87, streak: 32, badge: '🎖️', score: 8700 },
  { rank: 6, name: 'Miguel Torres', username: 'mig_torres', days: 85, streak: 30, badge: '🎖️', score: 8500 },
  { rank: 7, name: 'Sofia Garcia', username: 'sofia_g', days: 82, streak: 28, badge: '🎖️', score: 8200 },
  { rank: 8, name: 'Paolo Ramos', username: 'paolo_rpm', days: 80, streak: 25, badge: '🎖️', score: 8000 },
];

export default function LeaderboardSection() {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'hsl(var(--color-card-cream))',
        border: '3px solid hsl(var(--color-black-border))',
        borderRadius: '10px',
        boxShadow: '5px 5px 0 hsl(var(--color-black-border))',
      }}>
      {/* Gold header bar */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
        <div className="flex items-center gap-2">
          <Trophy size={16} style={{ color: 'hsl(var(--color-black-border))' }} />
          <h2
            className="font-black uppercase tracking-wide text-sm"
            style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>
            Leaderboard
          </h2>
          <span
            className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: 'hsl(var(--color-black-border))', color: 'hsl(var(--color-gold))', borderRadius: '3px' }}>
            Live
          </span>
        </div>
        <TrendingUp size={14} style={{ color: 'hsl(var(--color-black-border))' }} />
      </div>

      <div style={{ borderTop: 'none' }}>
        {mockLeaders.map((leader, idx) => (
          <div
            key={leader.rank}
            className="flex items-center gap-3 px-5 py-3 transition-colors"
            style={{
              borderBottom: idx < mockLeaders.length - 1 ? '1px solid hsl(47 40% 78%)' : 'none',
              background: leader.rank === 1 ? 'hsl(47 100% 55% / 0.12)' : 'transparent',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'hsl(47 100% 55% / 0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = leader.rank === 1 ? 'hsl(47 100% 55% / 0.12)' : 'transparent'; }}
          >
            <div className="w-7 text-center">
              {leader.rank <= 3 ? (
                <span className="text-lg">{leader.badge}</span>
              ) : (
                <span className="text-xs font-black" style={{ color: 'hsl(var(--color-text-muted))' }}>#{leader.rank}</span>
              )}
            </div>
            <div
              className="w-8 h-8 flex items-center justify-center text-sm font-black shrink-0"
              style={{
                background: 'hsl(var(--color-gold))',
                color: 'hsl(var(--color-black-border))',
                border: '2px solid hsl(var(--color-black-border))',
                borderRadius: '4px',
                boxShadow: '2px 2px 0 hsl(var(--color-black-border))',
              }}>
              {leader.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: 'hsl(var(--color-navy-deep))' }}>{leader.name}</div>
              <div className="text-[11px]" style={{ color: 'hsl(var(--color-text-muted))' }}>@{leader.username}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-black" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-navy-deep))' }}>{leader.score.toLocaleString()}</div>
              <div className="text-[11px]" style={{ color: 'hsl(var(--color-text-muted))' }}>Day {leader.days} · 🔥{leader.streak}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

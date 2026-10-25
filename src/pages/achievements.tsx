import { Helmet } from '@dr.pogodin/react-helmet';
import AppShell from '@/components/app/AppShell';

const today = new Date();

function generateHeatmap() {
  const cells: {date: string;level: number;}[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    cells.push({ date: d.toISOString().slice(0, 10), level: 0 });
  }
  return cells;
}

const HEATMAP = generateHeatmap();

const RADAR_DATA = [
{ subject: 'Abnormal Psych', value: 0, color: '#a78bfa' },
{ subject: 'I/O Psychology', value: 0, color: '#34d399' },
{ subject: 'Dev Psychology', value: 0, color: 'hsl(var(--color-gold))' },
{ subject: 'Psych Assessment', value: 0, color: '#60a5fa' }];


const TITLES = [
{ level: 1, name: 'Aspiring Psychometrician', emoji: '🌱', days: 0, unlocked: true },
{ level: 2, name: 'Dedicated Reviewee', emoji: '📖', days: 10, unlocked: false },
{ level: 3, name: 'Consistent Scholar', emoji: '🎓', days: 25, unlocked: false },
{ level: 4, name: 'Focused Candidate', emoji: '🎯', days: 50, unlocked: false },
{ level: 5, name: 'Elite Reviewer', emoji: '⭐', days: 75, unlocked: false },
{ level: 6, name: 'Topnotcher', emoji: '🏆', days: 100, unlocked: false }];


const BADGES = [
{ emoji: '🌱', name: 'Seedling', desc: 'Day 1 complete', earned: false },
{ emoji: '🔥', name: 'On Fire', desc: '7-day streak', earned: false },
{ emoji: '💪', name: 'Grinder', desc: '30 days logged', earned: false },
{ emoji: '📚', name: 'Bookworm', desc: '50 hrs studied', earned: false },
{ emoji: '🎯', name: 'Sharpshooter', desc: '85% mock score', earned: false },
{ emoji: '🏆', name: 'Topnotcher', desc: 'Complete 100 days', earned: false },
{ emoji: '⭐', name: 'Star Reviewer', desc: 'All subjects covered', earned: false },
{ emoji: '🦁', name: 'Lion Heart', desc: '60-day streak', earned: false }];


function SectionCard({ title, children }: {title: string;children: React.ReactNode;}) {
  return (
    <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(222 50% 16% / 0.12)', borderRadius: '14px', boxShadow: '0 1px 2px hsl(222 50% 16% / 0.06), 0 8px 24px -12px hsl(222 50% 16% / 0.15)', overflow: 'hidden' }}>
      <div className="px-5 py-3" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(222 50% 16% / 0.10)' }}>
        <h2 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>);

}

export default function AchievementsPage() {
  return (
    <AppShell activeSection="achievements">
      <Helmet>
        <title>Achievements & Metrics — ATRC Premium PMLeBoards</title>
        <meta name="description" content="View your PMLE study heatmap, subject proficiency scores, earned titles, and achievement badges. Celebrate your board exam preparation milestones." />
        <link rel="canonical" href="https://atrcpremium.com/achievements" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>🎖️ Achievements & Metrics</h1>

        {/* Heatmap */}
        <SectionCard title="📅 Monthly Study Heatmap (Last 30 Days)">
          <div className="flex flex-wrap gap-1.5">
            {HEATMAP.map((cell) =>
            <div
              key={cell.date}
              title={cell.date + (cell.level > 0 ? ` — Level ${cell.level}` : ' — No activity')}
              className="w-7 h-7 rounded"
              style={{
                background: cell.level === 0 ? 'hsl(var(--color-navy-mid))' :
                cell.level === 1 ? 'hsl(var(--color-heatmap-1))' :
                cell.level === 2 ? 'hsl(var(--color-heatmap-2))' :
                cell.level === 3 ? 'hsl(var(--color-heatmap-3))' :
                'hsl(var(--color-heatmap-4))',
                border: '1px solid hsl(var(--color-black-border) / 0.1)'
              }} />

            )}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>Less</span>
            {[0, 1, 2, 3, 4].map((l) =>
            <div key={l} className="w-4 h-4 rounded" style={{ background: l === 0 ? 'hsl(var(--color-navy-mid))' : l === 1 ? 'hsl(var(--color-heatmap-1))' : l === 2 ? 'hsl(var(--color-heatmap-2))' : l === 3 ? 'hsl(var(--color-heatmap-3))' : 'hsl(var(--color-heatmap-4))' }} />
            )}
            <span className="text-[10px]" style={{ color: 'hsl(var(--color-body-muted))' }}>More</span>
          </div>
        </SectionCard>

        {/* Subject Proficiency */}
        <SectionCard title="📊 Subject Proficiency">
          <div className="space-y-3">
            {RADAR_DATA.map(({ subject, value, color }) =>
            <div key={subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{subject}</span>
                  <span className="text-xs font-black" style={{ color }}>{value}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--color-navy-mid))' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Titles */}
        <SectionCard title="🎖️ Title Progression">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TITLES.map((t: typeof TITLES[number]) =>
            <div key={t.level} className="flex items-center gap-3 p-3 rounded" style={{ background: t.unlocked ? 'hsl(var(--color-gold) / 0.1)' : 'hsl(var(--color-navy-mid))', border: `2px solid ${t.unlocked ? 'hsl(var(--color-gold))' : 'hsl(var(--color-divider-cream))'}`, opacity: t.unlocked ? 1 : 0.6 }}>
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <p className="text-xs font-black uppercase" style={{ color: "#ffcd1a" }}>Lv. {t.level}</p>
                  <p className="text-xs font-bold" style={{ color: "#2a3847" }}>{t.name}</p>
                  <p className="text-[10px]" style={{ color: "#2a3847" }}>{t.days === 0 ? 'Starting title' : `Unlock at Day ${t.days}`}</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Badges */}
        <SectionCard title="🏅 Badge Collection">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((b: typeof BADGES[number]) =>
            <div key={b.name} className="flex flex-col items-center gap-1.5 p-3 rounded text-center" style={{ background: b.earned ? 'hsl(var(--color-gold) / 0.1)' : 'hsl(var(--color-navy-mid))', border: `2px solid ${b.earned ? 'hsl(var(--color-gold))' : 'hsl(var(--color-divider-cream))'}`, opacity: b.earned ? 1 : 0.5 }}>
                <span className="text-3xl">{b.emoji}</span>
                <p className="text-[11px] font-black uppercase" style={{ color: "#ffcd1a" }}>{b.name}</p>
                <p className="text-[10px]" style={{ color: "#ffffff" }}>{b.desc}</p>
              </div>
            )}
          </div>
        </SectionCard>
      </div>
    </AppShell>);

}
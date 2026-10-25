import { useState, useEffect, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Trophy, Search } from 'lucide-react';
import AppShell from '@/components/app/AppShell';
import { leaderboard } from 'virtual:content';

interface Leader {
  userId: string;
  name: string;
  totalHours: number;
  streakDays: number;
  rank: number;
  hoursAbnormal: number;
  hoursAssessment: number;
  hoursIo: number;
  hoursDevelopmental: number;
}

const RANK_BADGE: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const authHeader = (): HeadersInit => {
    const token = localStorage.getItem('atrc_session_token') ?? '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard', { headers: authHeader() });
      if (!res.ok) return;
      const data = await res.json() as { leaders: Leader[] };
      setLeaders(data.leaders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const filtered = leaders.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppShell activeSection="leaderboard">
      <Helmet>
        <title>Leaderboard — ATRC Premium PMLeBoards</title>
        <meta name="description" content="See how ATRC Premium members rank by study hours, streaks, and subject mastery. Compete and stay motivated on your PMLE journey." />
        <link rel="canonical" href="https://atrcpremium.com/leaderboard" />
        <meta name="robots" content="noindex, nofollow" />
        <meta property="og:title" content="PMLE Study Leaderboard — ATRC Premium" />
        <meta property="og:description" content="Track your rank among fellow Psychometrician board exam candidates. Study hours, streaks, and subject breakdowns." />
        <meta property="og:image" content="https://atrcpremium.com/og-image.svg" />
        <meta property="og:url" content="https://atrcpremium.com/leaderboard" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://atrcpremium.com/og-image.svg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://atrcpremium.com/leaderboard#webpage",
          "url": "https://atrcpremium.com/leaderboard",
          "name": "PMLE Study Leaderboard — ATRC Premium PMLeBoards",
          "description": "Leaderboard ranking ATRC Premium members by PMLE study hours, streaks, and subject mastery.",
          "isPartOf": { "@id": "https://atrcpremium.com/#website" },
          "about": { "@id": "https://atrcpremium.com/#organization" }
        }).replace(/</g, '\u003c')}</script>
      </Helmet>
      <div className="p-3 sm:p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        <h1 className="text-2xl sm:text-3xl font-black uppercase" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))' }}>{leaderboard.heading}</h1>

        {/* Subject breakdown legend */}
        {(() => {
          const subjectColors: Record<string, string> = {
            abnormal: '#a78bfa',
            assessment: '#60a5fa',
            io: '#34d399',
            developmental: 'hsl(var(--color-gold))',
          };
          return (
            <div className="flex flex-wrap gap-2">
              {leaderboard.subjects.map((s) => (
                <div key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap" style={{ background: 'transparent', border: '1.5px solid hsl(var(--color-hairline-strong))' }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: subjectColors[s.id] ?? '#aaa' }} />
                  <span className="text-xs font-semibold" style={{ color: 'hsl(var(--color-body-text))' }}>{s.label}</span>
                  <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--color-body-muted))' }}>{s.weight}</span>
                </div>
              ))}
            </div>
          );
        })()}

        <div style={{ background: 'hsl(var(--color-card-cream))', border: '1px solid hsl(222 50% 16% / 0.12)', borderRadius: '14px', boxShadow: '0 1px 2px hsl(222 50% 16% / 0.06), 0 8px 24px -12px hsl(222 50% 16% / 0.15)', overflow: 'hidden' }}>
          <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'hsl(var(--color-card-cream))', borderBottom: '1px solid hsl(222 50% 16% / 0.10)' }}>
            <Trophy size={16} style={{ color: 'hsl(var(--color-black-border))' }} />
            <h2 className="font-black uppercase tracking-wide text-sm flex-1" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>{leaderboard.cardTitle}</h2>
            <span className="text-[10px] font-black uppercase" style={{ color: 'hsl(var(--color-black-border) / 0.6)' }}>{leaderboard.cardSubtitle}</span>
          </div>

          {/* Search */}
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded" style={{ border: '2px solid hsl(var(--color-input-border))', background: 'hsl(var(--color-navy-mid))' }}>
              <Search size={14} style={{ color: 'hsl(var(--color-sidebar-text))' }} />
              <input
                type="text"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder={leaderboard.searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'hsl(var(--color-input-text))' }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto px-4 pb-4">
            {loading ? (
              <div className="py-10 text-center text-sm font-bold animate-pulse" style={{ color: 'hsl(var(--color-body-muted))' }}>{leaderboard.loadingText}</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '2px solid hsl(var(--color-divider-cream))' }}>
                    <th className="py-2 text-left text-[10px] font-black uppercase tracking-wide w-10" style={{ color: 'hsl(var(--color-body-muted))' }}>Rank</th>
                    <th className="py-2 text-left text-[10px] font-black uppercase tracking-wide" style={{ color: 'hsl(var(--color-body-muted))' }}>Challenger</th>
                    <th className="py-2 text-center text-[10px] font-black uppercase tracking-wide" style={{ color: 'hsl(var(--color-body-muted))' }}>Streak</th>
                    <th className="py-2 text-center text-[10px] font-black uppercase tracking-wide hidden sm:table-cell" style={{ color: 'hsl(var(--color-body-muted))' }}>Total Hrs</th>
                    <th className="py-2 text-left text-[10px] font-black uppercase tracking-wide hidden md:table-cell" style={{ color: 'hsl(var(--color-body-muted))' }}>Subject Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((l) => {
                    const total = l.totalHours || 1;
                    return (
                      <tr key={l.userId} style={{ borderBottom: '1px solid hsl(var(--color-divider-cream))' }}>
                        <td className="py-3">
                          <span className="text-base">{RANK_BADGE[l.rank] ?? `#${l.rank}`}</span>
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-sm" style={{ color: 'hsl(var(--color-body-text))' }}>{l.name}</div>
                        </td>
                        <td className="py-3 text-center">
                          <span className="font-black text-sm" style={{ color: 'hsl(var(--color-gold))' }}>🔥 {l.streakDays}</span>
                        </td>
                        <td className="py-3 text-center hidden sm:table-cell">
                          <span className="text-sm font-bold" style={{ color: 'hsl(var(--color-body-text))' }}>{l.totalHours.toFixed(1)}h</span>
                        </td>
                        <td className="py-3 hidden md:table-cell">
                          <div className="flex h-3 rounded overflow-hidden gap-px w-36">
                            {[
                              { h: l.hoursAbnormal,      color: '#a78bfa' },
                              { h: l.hoursAssessment,    color: '#60a5fa' },
                              { h: l.hoursIo,            color: '#34d399' },
                              { h: l.hoursDevelopmental, color: 'hsl(var(--color-gold))' },
                            ].map((s, i) => (
                              <div
                                key={i}
                                style={{ width: `${(s.h / total) * 100}%`, background: s.color, minWidth: s.h > 0 ? '3px' : '0' }}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="font-bold text-sm mb-1">{query ? 'No match found.' : 'No challengers yet.'}</div>
                        <div className="text-xs">Be the first! Start logging your study sessions to appear here.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

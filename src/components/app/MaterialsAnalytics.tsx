/**
 * Step 9: Admin analytics for Learning Materials.
 * Shows total views, unique viewers, and top materials.
 */
import { useState, useEffect } from 'react';
import { BarChart2, Loader2, Eye, Users } from 'lucide-react';

interface AnalyticsRow {
  materialId: string;
  name: string;
  totalViews: number;
  uniqueViewers: number;
}

function adminAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('atrc_session_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function MaterialsAnalytics() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/materials/analytics', { headers: adminAuthHeader() })
      .then(r => r.json())
      .then((data: AnalyticsRow[]) => setRows(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const totalViews = rows.reduce((s, r) => s + r.totalViews, 0);
  const totalUnique = rows.reduce((s, r) => s + r.uniqueViewers, 0);

  if (loading) return (
    <div className="py-10 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
      <Loader2 size={24} className="animate-spin mx-auto mb-2" />
      <p className="text-sm">Loading analytics…</p>
    </div>
  );

  if (error) return (
    <div className="py-6 text-center text-sm" style={{ color: 'hsl(var(--color-danger))' }}>{error}</div>
  );

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.3)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Eye size={14} style={{ color: 'hsl(var(--color-gold))' }} />
            <span className="text-[10px] font-black uppercase" style={{ color: 'hsl(var(--color-white))' }}>Total Views</span>
          </div>
          <p className="text-2xl font-black" style={{ color: 'hsl(var(--color-page-bg))' }}>{totalViews.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded" style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.3)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} style={{ color: 'hsl(var(--color-gold))' }} />
            <span className="text-[10px] font-black uppercase" style={{ color: 'hsl(var(--color-white))' }}>Unique Viewers</span>
          </div>
          <p className="text-2xl font-black" style={{ color: 'hsl(var(--color-page-bg))' }}>{totalUnique.toLocaleString()}</p>
        </div>
      </div>

      {/* Top materials table */}
      {rows.length === 0 ? (
        <div className="py-8 text-center" style={{ color: 'hsl(var(--color-body-muted))' }}>
          <BarChart2 size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-bold">No view data yet</p>
          <p className="text-xs mt-1">Views will appear here once students open materials.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '2px solid hsl(var(--color-divider-cream))' }}>
                <th className="py-2 px-2 text-left font-black uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>Material</th>
                <th className="py-2 px-2 text-right font-black uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>Views</th>
                <th className="py-2 px-2 text-right font-black uppercase" style={{ color: 'hsl(var(--color-body-muted))' }}>Unique</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.materialId} style={{ borderBottom: '1px solid hsl(var(--color-divider-cream))' }}>
                  <td className="py-2 px-2 font-medium truncate max-w-[200px]" style={{ color: 'hsl(var(--color-body-text))' }}>{r.name}</td>
                  <td className="py-2 px-2 text-right font-bold" style={{ color: 'hsl(var(--color-gold))' }}>{r.totalViews}</td>
                  <td className="py-2 px-2 text-right" style={{ color: 'hsl(var(--color-body-muted))' }}>{r.uniqueViewers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

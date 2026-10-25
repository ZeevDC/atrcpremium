import { FileText, Plus, TrendingUp } from 'lucide-react';

const subjects = [
  { name: 'General Psychology', code: 'GP', color: 'hsl(var(--color-gold))', scores: [72, 78, 81, 85, 88], target: 90 },
  { name: 'Developmental Psychology', code: 'DP', color: '#60a5fa', scores: [65, 70, 74, 79, 82], target: 85 },
  { name: 'Abnormal Psychology', code: 'AP', color: '#a78bfa', scores: [60, 68, 72, 76, 80], target: 85 },
  { name: 'Industrial/Org Psychology', code: 'IO', color: '#34d399', scores: [70, 75, 78, 82, 86], target: 90 },
];

export default function MockExamSection() {
  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', borderRadius: '10px', boxShadow: '5px 5px 0 hsl(var(--color-black-border))' }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
        <div className="flex items-center gap-2">
          <FileText size={16} style={{ color: 'hsl(var(--color-black-border))' }} />
          <h2 className="font-bold uppercase tracking-wide text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>Mock Exam Tracker</h2>
        </div>
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
          style={{ background: 'hsl(var(--color-gold))', color: '#1a1200' }}
        >
          <Plus size={12} /> Log Score
        </button>
      </div>

      <div className="p-5 space-y-4">
        {subjects.map((subj) => {
          const latest = subj.scores[subj.scores.length - 1];
          const progress = (latest / subj.target) * 100;
          return (
            <div key={subj.code}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: subj.color + '33', color: subj.color }}>{subj.code}</span>
                  <span className="text-sm font-medium text-foreground">{subj.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: subj.color }}>{latest}%</span>
                  <span className="text-xs text-muted-foreground">/ {subj.target}%</span>
                  <TrendingUp size={12} className="text-green-400" />
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(progress, 100)}%`, background: subj.color }}
                />
              </div>
              <div className="flex gap-1 mt-1.5">
                {subj.scores.map((score, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-xs py-0.5 rounded"
                    style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                  >
                    {score}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

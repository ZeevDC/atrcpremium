import { Target, CheckCircle2 } from 'lucide-react';

const todayChallenge = {
  day: 160,
  title: 'Abnormal Psychology Sprint',
  desc: 'Complete 50 practice questions on Mood Disorders and Anxiety Disorders. Review DSM-5-TR criteria for each.',
  tasks: [
    { id: 1, text: 'Read Chapter 12: Mood Disorders (30 mins)', done: true },
    { id: 2, text: 'Answer 25 MCQs on Depression', done: true },
    { id: 3, text: 'Answer 25 MCQs on Anxiety Disorders', done: false },
    { id: 4, text: 'Review wrong answers and note key concepts', done: false },
  ],
  xp: 150,
};

export default function DailyChallengeSection() {
  const completed = todayChallenge.tasks.filter((t) => t.done).length;
  const progress = (completed / todayChallenge.tasks.length) * 100;

  return (
    <div className="rounded-2xl border border-border overflow-hidden" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', borderRadius: '10px', boxShadow: '5px 5px 0 hsl(var(--color-black-border))' }}>
      <div className="flex items-center justify-between px-5 py-3" style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
        <div className="flex items-center gap-2">
          <Target size={16} style={{ color: 'hsl(var(--color-black-border))' }} />
          <h2 className="font-bold uppercase tracking-wide text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>Daily Challenge</h2>
          <span className="text-xs font-bold" style={{ color: 'hsl(var(--color-navy-mid))' }}>Day {todayChallenge.day}</span>
        </div>
        <span className="text-xs font-black px-2 py-0.5" style={{ background: 'hsl(var(--color-black-border))', color: 'hsl(var(--color-gold))', borderRadius: '3px' }}>
          +{todayChallenge.xp} XP
        </span>
      </div>
      <div className="p-3 sm:p-5">
        <h3 className="font-black text-sm uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-navy-deep))' }}>{todayChallenge.title}</h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'hsl(var(--color-text-muted))' }}>{todayChallenge.desc}</p>

        {/* Progress */}
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span style={{ color: 'hsl(var(--color-text-muted))' }}>{completed}/{todayChallenge.tasks.length} tasks</span>
          <span style={{ color: 'hsl(var(--color-navy-deep))' }} className="font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: 'hsl(var(--color-gold) / 0.35)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: progress + '%', background: 'hsl(var(--color-gold))' }} />
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {todayChallenge.tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-2.5">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0"
                style={{ color: task.done ? 'hsl(var(--color-gold-dark))' : 'hsl(var(--color-gold) / 0.5)' }}
              />
              <span className="text-sm" style={{ color: task.done ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', textDecoration: task.done ? 'line-through' : 'none' }}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

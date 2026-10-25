import { motion } from 'motion/react';

const stats = [
  { value: '56', label: 'Challengers', emoji: '👥', pulse: false },
  { value: 'Day 160', label: 'Current Day', emoji: '📅', pulse: false },
  { value: '0', label: 'Active Today', emoji: '⚡', pulse: true },
  { value: '4', label: 'Subjects', emoji: '📚', pulse: false },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="relative p-4 flex flex-col gap-1 overflow-hidden"
          style={{
            background: 'hsl(var(--color-card-cream))',
            border: '2.5px solid hsl(var(--color-black-border))',
            borderRadius: '8px',
            boxShadow: '4px 4px 0 hsl(var(--color-black-border))',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">{stat.emoji}</span>
            {stat.pulse && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            )}
          </div>
          <div className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-navy-deep))' }}>
            {stat.value}
          </div>
          <div className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--color-navy-light))' }}>{stat.label}</div>
          {/* Gold bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'hsl(var(--color-gold))' }} />
        </motion.div>
      ))}
    </div>
  );
}

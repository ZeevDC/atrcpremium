import { motion } from 'motion/react';

interface HeroSectionProps {
  onJoinClick: () => void;
}

export default function HeroSection({ onJoinClick }: HeroSectionProps) {
  return (
    <section
      className="relative overflow-hidden p-6 md:p-10"
      style={{
        background: 'hsl(var(--color-navy-deep))',
        border: '3px solid hsl(var(--color-black-border))',
        borderRadius: '12px',
        boxShadow: '6px 6px 0 hsl(var(--color-black-border))',
      }}>
      {/* Sunburst rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: '10px' }}>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'conic-gradient(from 0deg at 50% 50%, hsl(var(--color-sunburst-a)) 0deg, hsl(var(--color-sunburst-b)) 20deg, hsl(var(--color-sunburst-a)) 40deg, hsl(var(--color-sunburst-b)) 60deg, hsl(var(--color-sunburst-a)) 80deg, hsl(var(--color-sunburst-b)) 100deg, hsl(var(--color-sunburst-a)) 120deg, hsl(var(--color-sunburst-b)) 140deg, hsl(var(--color-sunburst-a)) 160deg, hsl(var(--color-sunburst-b)) 180deg, hsl(var(--color-sunburst-a)) 200deg, hsl(var(--color-sunburst-b)) 220deg, hsl(var(--color-sunburst-a)) 240deg, hsl(var(--color-sunburst-b)) 260deg, hsl(var(--color-sunburst-a)) 280deg, hsl(var(--color-sunburst-b)) 300deg, hsl(var(--color-sunburst-a)) 320deg, hsl(var(--color-sunburst-b)) 340deg)',
          }}
        />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--foreground) / 0.9) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        {/* Gold sparkle — top right */}
        <div className="absolute top-4 right-6 opacity-35 select-none" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path d="M26 4 L28 22 L26 26 L24 22 Z" fill="hsl(47 100% 55%)"/>
            <path d="M48 26 L30 28 L26 26 L30 24 Z" fill="hsl(47 100% 55%)"/>
            <path d="M26 48 L24 30 L26 26 L28 30 Z" fill="hsl(47 100% 55%)" opacity="0.7"/>
            <path d="M4 26 L22 24 L26 26 L22 28 Z" fill="hsl(47 100% 55%)" opacity="0.7"/>
            <circle cx="26" cy="26" r="2.5" fill="hsl(47 100% 65%)"/>
          </svg>
        </div>
        {/* Gold swirl — bottom left */}
        <div className="absolute bottom-6 left-4 opacity-20 select-none" aria-hidden>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path d="M28 6 C46 6 50 18 50 28 C50 40 42 50 28 50 C18 50 10 42 10 32 C10 24 16 18 24 18 C30 18 34 22 34 28 C34 32 32 34 28 34" stroke="hsl(47 100% 55%)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-4"
          style={{ background: 'hsl(var(--color-gold) / 0.12)', border: '1.5px solid hsl(var(--color-gold) / 0.4)', borderRadius: '999px' }}
        >
          <span className="text-xs">🍓</span>
          <span className="text-xs font-bold tracking-wide" style={{ color: 'hsl(var(--color-gold))' }}>PMLE / RPM 2026 · Cohort 1</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-text-bright))', textShadow: '2px 2px 0 hsl(var(--color-shadow-dark))' }}
        >
          100 Days<br />
          <span style={{ color: 'hsl(var(--color-gold))' }}>Study Challenge</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg italic font-medium mb-4"
          style={{ color: 'hsl(var(--color-gold))' }}
        >
          "Discipline Today. Topnotcher Tomorrow."
        </motion.p>

        {/* Body */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-sm md:text-base max-w-xl mb-5 leading-relaxed"
          style={{ color: 'hsl(var(--color-text-muted))' }}
        >
          100 days of focused study. One licensure. A lifetime of impact. Track your progress, compete with peers, and earn your place among topnotchers.
        </motion.p>

        {/* Target date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 text-sm"
          style={{ background: 'hsl(var(--color-surface-elevated))', border: '1.5px solid hsl(var(--color-gold) / 0.3)', borderRadius: '6px' }}
        >
          <span>🎯</span>
          <span style={{ color: 'hsl(var(--color-text-muted))' }}>Target Date:</span>
          <span className="font-bold" style={{ color: 'hsl(var(--color-text-bright))' }}>August 19, 2026</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-3"
        >
          <button
            onClick={onJoinClick}
            className="flex items-center gap-2 px-6 py-3 font-black text-sm transition-all active:translate-y-[2px] active:translate-x-[2px]"
            style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2.5px solid hsl(var(--color-black-border))', borderRadius: '6px', boxShadow: '3px 3px 0 hsl(var(--color-black-border))', fontFamily: 'var(--font-display)' }}
          >
            🍓 Join the Challenge
          </button>
          <button
            className="flex items-center gap-2 px-6 py-3 font-black text-sm transition-all active:translate-y-[2px] active:translate-x-[2px]"
            style={{ background: 'transparent', color: 'hsl(var(--color-gold))', border: '2.5px solid hsl(var(--color-gold))', borderRadius: '6px', boxShadow: '3px 3px 0 hsl(var(--color-gold) / 0.4)', fontFamily: 'var(--font-display)' }}
          >
            📋 Log Today
          </button>
        </motion.div>
      </div>
    </section>
  );
}

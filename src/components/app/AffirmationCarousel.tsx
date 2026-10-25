import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const affirmations = [
  {
    "quote": "\"The secret of getting ahead is getting started.\"",
    "author": "Mark Twain",
    "text": "I am capable. I am consistent. Today I choose to study, to grow, and to become the topnotcher I was born to be. 🍓"
  },
  {
    "quote": "\"Success is the sum of small efforts, repeated day in and day out.\"",
    "author": "Robert Collier",
    "text": "Every page I read, every question I answer, every hour I study — it all adds up. I am building my future one day at a time. 💪"
  },
  {
    "quote": "\"Believe you can and you're halfway there.\"",
    "author": "Theodore Roosevelt",
    "text": "I believe in my preparation. I trust my process. The board exam is not my enemy — it is my stage. 🌟"
  },
  {
    "quote": "\"It always seems impossible until it's done.\"",
    "author": "Nelson Mandela",
    "text": "The topnotcher list has my name on it. I just have to show up today, and every day after. 🎯"
  },
  {
    "quote": "\"Hard work beats talent when talent doesn't work hard.\"",
    "author": "Tim Notke",
    "text": "I may not be the smartest in the room, but I will be the most prepared. Consistency is my superpower. 🔥"
  }
];

export default function AffirmationCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => (i - 1 + affirmations.length) % affirmations.length);
  }, []);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((i) => (i + 1) % affirmations.length);
  }, []);

  const shuffle = useCallback(() => {
    setDirection(1);
    setIndex((i) => {
      let next = Math.floor(Math.random() * affirmations.length);
      while (next === i) next = Math.floor(Math.random() * affirmations.length);
      return next;
    });
  }, []);

  const current = affirmations[index];

  return (
    <div
      className="rounded-2xl border border-border p-5 md:p-6 overflow-hidden"
      style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', borderRadius: '10px', boxShadow: '5px 5px 0 hsl(var(--color-black-border))' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">✨</span>
        <span className="text-xs font-black uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-navy-deep))' }}>Daily Affirmation</span>
        <span className="ml-auto text-xs text-muted-foreground">{index + 1} / {affirmations.length}</span>
      </div>

      <div className="min-h-[120px] relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={{ duration: 0.3, ease: 'easeOut' as const }}
          >
            <blockquote
              className="text-lg md:text-xl font-bold italic mb-1 leading-snug"
              style={{ fontFamily: 'var(--font-heading)', color: 'hsl(var(--color-gold))' }}
            >
              {current.quote}
            </blockquote>
            <cite className="text-xs text-muted-foreground not-italic mb-3 block">— {current.author}</cite>
            <p className="text-sm text-foreground/90 leading-relaxed">{current.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <button
          onClick={prev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button
          onClick={shuffle}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-muted"
          style={{ color: 'hsl(var(--color-gold))' }}
        >
          <Shuffle size={14} /> Shuffle
        </button>
        <button
          onClick={next}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

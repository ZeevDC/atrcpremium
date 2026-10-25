import { useState } from 'react';
import { X } from 'lucide-react';

interface JoinModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const tracks = [
  { id: 'working', label: '3–4 hrs', desc: 'Working Reviewee' },
  { id: 'fulltime', label: '6–8 hrs', desc: 'Full-Time Reviewee' },
  { id: 'hardcore', label: '10–12 hrs', desc: 'Hardcore Reviewee' },
];

export default function JoinModal({ onClose, onSwitchToLogin }: JoinModalProps) {
  const [selectedTrack, setSelectedTrack] = useState('fulltime');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: 'hsl(var(--color-navy))' }}
        role="dialog"
        aria-modal="true"
        aria-label="Join the Challenge"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border" style={{ background: 'hsl(var(--color-navy))' }}>
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              🍓 Join the Challenge
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">100 Days. One Goal. Topnotcher.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">First Name</label>
              <input
                type="text"
                placeholder="Juan"
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Username</label>
              <input
                type="text"
                placeholder="topnotcher2026"
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email Address *</label>
            <input
              type="email"
              placeholder="juan@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Track selector */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">Choose Your Track</label>
            <div className="grid grid-cols-3 gap-2">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrack(t.id)}
                  className="flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center"
                  style={{
                    borderColor: selectedTrack === t.id ? 'hsl(var(--color-gold))' : 'hsl(var(--border))',
                    background: selectedTrack === t.id ? 'hsl(var(--color-gold) / 0.12)' : 'hsl(var(--muted))',
                  }}
                >
                  <span className="text-sm font-bold" style={{ color: selectedTrack === t.id ? 'hsl(var(--color-gold))' : 'hsl(var(--foreground))' }}>{t.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Your Motivation (optional)</label>
            <textarea
              placeholder="Why are you taking this challenge? What drives you? 🍓"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <button
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'hsl(var(--color-gold))', color: '#1a1200' }}
          >
            🍵 Start My 100 Days
          </button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            By joining, you commit to showing up daily. No log = Invalid Day.{' '}
            <button onClick={onSwitchToLogin} className="text-primary hover:underline">
              Already have an account? Log in here →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

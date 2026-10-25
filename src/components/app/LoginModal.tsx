import { X } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
  onSwitchToJoin: () => void;
}

export default function LoginModal({ onClose, onSwitchToJoin }: LoginModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{ background: 'hsl(var(--color-navy))' }}
        role="dialog"
        aria-modal="true"
        aria-label="Log In"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
              🔑 Welcome Back
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">BoardPass PH · PMLE / RPM 2026</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Candidate Email Address</label>
            <input
              type="email"
              placeholder="juan@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Review Password (Required)</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-border bg-muted text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'hsl(var(--color-gold))', color: '#1a1200' }}
          >
            🌟 Launch Study Room
          </button>

          <div className="flex flex-col gap-1 text-center">
            <button onClick={onSwitchToJoin} className="text-xs text-primary hover:underline">
              New Candidate? Sign Up for an Account
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground">
              Troubleshoot / Forgot Password? Restore Access
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © 2026 BoardPassPH Review. All psychiatric indices updated to DSM-5-TR.
          </p>
        </div>
      </div>
    </div>
  );
}

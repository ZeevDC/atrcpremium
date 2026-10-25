/**
 * Step 5: Password prompt modal for password-protected materials.
 * Calls POST /api/materials/verify-password and stores the access token
 * in sessionStorage so the user isn't re-prompted within the same session.
 */
import { useState, useRef, useEffect } from 'react';
import { Lock, Loader2, X, Eye, EyeOff } from 'lucide-react';

interface MaterialPasswordModalProps {
  materialName: string;
  materialId: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('atrc_session_token') ?? '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function sessionKeyFor(materialId: string) {
  return `mat_pw_token_${materialId}`;
}

export default function MaterialPasswordModal({
  materialName, materialId, onSuccess, onCancel,
}: MaterialPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/materials/verify-password', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId, password }),
      });
      const data = await res.json() as { token?: string; expiresAt?: number; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Incorrect password.');
        return;
      }
      if (data.token) {
        sessionStorage.setItem(sessionKeyFor(materialId), JSON.stringify({ token: data.token, expiresAt: data.expiresAt }));
        onSuccess(data.token);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'hsl(var(--overlay-dark) / 0.8)' }}>
      <div className="w-full max-w-sm rounded-xl p-5 space-y-4" style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', boxShadow: '6px 6px 0 hsl(var(--color-black-border))' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={16} style={{ color: 'hsl(var(--color-gold))' }} />
            <h3 className="font-black uppercase text-sm" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-navy))' }}>
              Password Required
            </h3>
          </div>
          <button onClick={onCancel} style={{ color: 'hsl(var(--color-body-muted))' }}>
            <X size={16} />
          </button>
        </div>

        <p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>
          <strong style={{ color: 'hsl(var(--color-body-text))' }}>{materialName}</strong> is password-protected. Enter the password to access it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password…"
              className="w-full pr-10 text-sm"
              style={{ background: 'hsl(var(--color-navy-mid))', border: `2px solid ${error ? 'hsl(var(--color-danger))' : 'hsl(var(--color-gold) / 0.5)'}`, borderRadius: '6px', color: 'hsl(var(--color-input-text))', padding: '8px 36px 8px 10px', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: 'hsl(var(--color-body-muted))' }}
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {error && (
            <p className="text-xs font-bold" style={{ color: 'hsl(var(--color-danger))' }}>{error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex-1 py-2 text-xs font-black uppercase rounded flex items-center justify-center gap-1.5 disabled:opacity-50"
              style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '1.5px solid hsl(var(--color-black-border))' }}
            >
              {loading ? <><Loader2 size={12} className="animate-spin" /> Verifying…</> : '🔓 Unlock'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold uppercase rounded"
              style={{ border: '2px solid hsl(var(--color-black-border))', color: 'hsl(var(--color-body-text))' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

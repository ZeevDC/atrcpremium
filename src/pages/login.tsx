import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { saveSessionToken } from '@/lib/auth/auth-client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = (await res.json()) as {
        token?: string;
        data?: { token?: string };
        message?: string;
        error?: { message?: string } | string;
      };
      // BetterAuth returns token at top-level or nested under data;
      // errors come as { message } at top-level or nested under error
      const token = data.token ?? data.data?.token;
      const errMsg = data.message
        ?? (typeof data.error === 'string' ? data.error : data.error?.message);
      if (!res.ok || errMsg) {
        setError(errMsg ?? 'Invalid email or password.');
      } else if (token) {
        saveSessionToken(token);
        // Trigger session refresh across all hooks
        window.dispatchEvent(new Event('atrc-session-changed'));
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign In — ATRC Premium</title>
        <meta name="description" content="Sign in to ATRC Premium." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Full-page paper background */}
      <div
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'hsl(var(--color-page-bg))' }}>
        
        {/* Faint radial warm glow */}
        <div
          className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-50"
          style={{ background: 'radial-gradient(ellipse at top right, hsl(var(--color-accent) / 0.12), transparent 65%)' }} />
        

        {/* Brand header */}
        <div className="text-center mb-8">
          <span className="editorial-eyebrow block mb-3" style={{ color: 'hsl(var(--color-accent))' }}>˗ˏˋ 𝚿 ˎˊ˗

          </span>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              fontWeight: 600,
              color: 'hsl(var(--color-navy))',
              letterSpacing: '-0.02em',
              lineHeight: 1.05
            }}>
            
            ATRC <em style={{ fontStyle: 'italic', color: 'hsl(var(--color-accent))' }}>Premium</em>
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'hsl(var(--color-body-muted))', fontFamily: "'DM Sans', sans-serif" }}>
            Sign in to your study portal
          </p>
        </div>

        {/* Login card */}
        <div
          className="w-full max-w-[400px] rounded-2xl overflow-hidden"
          style={{
            background: 'hsl(var(--color-card-cream))',
            border: '1px solid hsl(222 50% 16% / 0.12)',
            boxShadow: '0 4px 6px hsl(222 50% 16% / 0.06), 0 20px 48px -12px hsl(222 50% 16% / 0.18)'
          }}>
          
          <div className="px-6 pt-6 pb-2 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(222 50% 16% / 0.08)' }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem',
                fontWeight: 500,
                color: 'hsl(var(--color-navy))'
              }}>
              
              Sign In
            </span>
            <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-body-muted))' }}>ATRC Portal</span>
          </div>

          <div className="px-6 py-6">
            {error &&
            <div
              className="mb-4 px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{
                background: 'hsl(0 72% 52% / 0.08)',
                border: '1px solid hsl(0 72% 52% / 0.25)',
                color: 'hsl(0 65% 35%)'
              }}>
              
                {error}
              </div>
            }

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5"
                  style={{ color: 'hsl(var(--color-label))' }}>
                  
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm focus:outline-none transition-all rounded-lg"
                  style={{
                    background: 'hsl(var(--color-input-bg))',
                    border: '1px solid hsl(222 50% 16% / 0.18)',
                    color: 'hsl(var(--color-input-text))'
                  }}
                  onFocus={(e) => {e.currentTarget.style.borderColor = 'hsl(var(--color-accent))';e.currentTarget.style.boxShadow = '0 0 0 3px hsl(43 72% 47% / 0.15)';}}
                  onBlur={(e) => {e.currentTarget.style.borderColor = 'hsl(222 50% 16% / 0.18)';e.currentTarget.style.boxShadow = 'none';}} />
                
              </div>

              <div>
                <label
                  className="block text-[11px] font-medium uppercase tracking-[0.14em] mb-1.5"
                  style={{ color: 'hsl(var(--color-label))' }}>
                  
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm focus:outline-none transition-all rounded-lg"
                    style={{
                      background: 'hsl(var(--color-input-bg))',
                      border: '1px solid hsl(222 50% 16% / 0.18)',
                      color: 'hsl(var(--color-input-text))'
                    }}
                    onFocus={(e) => {e.currentTarget.style.borderColor = 'hsl(var(--color-accent))';e.currentTarget.style.boxShadow = '0 0 0 3px hsl(43 72% 47% / 0.15)';}}
                    onBlur={(e) => {e.currentTarget.style.borderColor = 'hsl(222 50% 16% / 0.18)';e.currentTarget.style.boxShadow = 'none';}} />
                  
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity opacity-40 hover:opacity-70"
                    style={{ color: 'hsl(var(--color-body-muted))' }}
                    tabIndex={-1}>
                    
                    {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium transition-colors"
                  style={{ color: 'hsl(var(--color-accent))' }}>
                  
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-60"
                style={{
                  background: 'hsl(var(--color-navy))',
                  color: 'hsl(var(--color-page-bg))',
                  boxShadow: '0 1px 3px hsl(222 50% 16% / 0.20), 0 4px 12px -4px hsl(222 50% 16% / 0.25)'
                }}
                onMouseEnter={(e) => {if (!loading) {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(222 50% 20%)';(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';}}}
                onMouseLeave={(e) => {(e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--color-navy))';(e.currentTarget as HTMLButtonElement).style.transform = 'none';}}>
                
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>
              Don't have an account?{' '}
              <Link to="/join" className="font-medium transition-colors" style={{ color: 'hsl(var(--color-accent))' }}>
                Join ATRC Premium
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>);

}
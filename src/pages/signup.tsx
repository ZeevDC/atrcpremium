import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { signUp, saveSessionToken } from '@/lib/auth/auth-client';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const result = await signUp.email({ name: name.trim(), email: email.trim(), password });
      if (result.error) {
        setError(result.error.message ?? 'Registration failed. Your email may not be on the access list.');
      } else {
        if (result.data?.token) {
          saveSessionToken(result.data.token);
          window.dispatchEvent(new Event('atrc-session-changed'));
        }
        navigate('/');
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
        <title>Sign Up — ATRC Premium</title>
        <meta name="description" content="Create your ATRC Premium account. Pre-approved emails only." />
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ── Full-page pubmat shell ── */}
      <div
        className="relative min-h-screen flex flex-col overflow-hidden"
        style={{ background: 'hsl(var(--color-navy))' }}>

        {/* Conic sunburst rays */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'conic-gradient(from 0deg at 50% 42%, hsl(var(--color-sunburst-a)) 0deg, hsl(var(--color-sunburst-b)) 20deg, hsl(var(--color-sunburst-a)) 40deg, hsl(var(--color-sunburst-b)) 60deg, hsl(var(--color-sunburst-a)) 80deg, hsl(var(--color-sunburst-b)) 100deg, hsl(var(--color-sunburst-a)) 120deg, hsl(var(--color-sunburst-b)) 140deg, hsl(var(--color-sunburst-a)) 160deg, hsl(var(--color-sunburst-b)) 180deg, hsl(var(--color-sunburst-a)) 200deg, hsl(var(--color-sunburst-b)) 220deg, hsl(var(--color-sunburst-a)) 240deg, hsl(var(--color-sunburst-b)) 260deg, hsl(var(--color-sunburst-a)) 280deg, hsl(var(--color-sunburst-b)) 300deg, hsl(var(--color-sunburst-a)) 320deg, hsl(var(--color-sunburst-b)) 340deg, hsl(var(--color-sunburst-a)) 360deg)'
          }} />

        {/* Centre radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 75% 55% at 50% 42%, hsl(var(--color-navy-mid) / 0.55) 0%, transparent 70%)'
          }} />

        {/* Halftone dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground) / 0.9) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }} />

        {/* Gold sparkle — top-left */}
        <div className="pointer-events-none absolute top-16 left-8 opacity-40 select-none" aria-hidden>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M40 8 L43 36 L40 40 L37 36 Z" fill="hsl(47 100% 55%)" opacity="0.9" />
            <path d="M72 40 L44 43 L40 40 L44 37 Z" fill="hsl(47 100% 55%)" opacity="0.9" />
            <path d="M40 72 L37 44 L40 40 L43 44 Z" fill="hsl(47 100% 55%)" opacity="0.7" />
            <path d="M8 40 L36 37 L40 40 L36 43 Z" fill="hsl(47 100% 55%)" opacity="0.7" />
            <circle cx="40" cy="40" r="3" fill="hsl(47 100% 65%)" />
          </svg>
        </div>

        {/* Gold sparkle — bottom-right */}
        <div className="pointer-events-none absolute bottom-24 right-6 opacity-30 select-none" aria-hidden>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <path d="M26 4 L28 23 L26 26 L24 23 Z" fill="hsl(47 100% 55%)" />
            <path d="M48 26 L29 28 L26 26 L29 24 Z" fill="hsl(47 100% 55%)" />
            <path d="M26 48 L24 29 L26 26 L28 29 Z" fill="hsl(47 100% 55%)" opacity="0.7" />
            <path d="M4 26 L23 24 L26 26 L23 28 Z" fill="hsl(47 100% 55%)" opacity="0.7" />
          </svg>
        </div>

        {/* Gold swirl — top-right */}
        <div className="pointer-events-none absolute top-20 right-10 opacity-25 select-none" aria-hidden>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M32 8 C48 8 56 20 56 32 C56 44 48 56 32 56 C20 56 12 48 12 36 C12 28 18 22 26 22 C32 22 36 26 36 32 C36 36 34 38 32 38" stroke="hsl(47 100% 55%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top warning tape */}
        <div className="tape-stripe h-[8px] w-full flex-shrink-0 z-10 relative" />

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-[400px] relative z-10">

            {/* Brand header */}
            <div className="text-center mb-6">
              <p
                className="text-xs font-black uppercase tracking-[0.25em] mb-1"
                style={{ color: 'hsl(var(--color-gold))', fontFamily: 'var(--font-display)' }}>
                PMLE BOARD REVIEW
              </p>
              <h1
                className="text-5xl font-black uppercase leading-none mb-1"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'hsl(var(--foreground))',
                  textShadow: '3px 3px 0 hsl(214 28% 10%)',
                  letterSpacing: '-0.01em'
                }}>
                ATRC
              </h1>
              <div
                className="inline-block text-lg font-black uppercase tracking-[0.12em] px-3 py-0.5 mt-1"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'hsl(var(--color-navy-text))',
                  background: 'hsl(var(--color-gold))',
                  border: '2px solid hsl(var(--color-navy-btn))',
                  boxShadow: '2px 2px 0 hsl(var(--color-navy-btn))'
                }}>
                PREMIUM
              </div>
            </div>

            {/* Signup card */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: 'hsl(var(--color-card-cream))',
                border: '3px solid hsl(var(--color-black-border))',
                boxShadow: '5px 5px 0 hsl(var(--color-black-border))'
              }}>

              {/* Card header bar — gold */}
              <div
                className="px-6 py-3 flex items-center gap-2"
                style={{ background: 'hsl(var(--color-gold))', borderBottom: '2px solid hsl(var(--color-black-border))' }}>
                <span className="text-sm font-black uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-navy-text))' }}>Create Account</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--color-card-header-sub))' }}>Allowlist Only</span>
              </div>

              <div className="px-6 py-6">
                {error && (
                  <div
                    className="mb-4 px-4 py-2.5 rounded text-sm font-bold"
                    style={{
                      background: 'hsl(var(--color-error-bg) / 0.12)',
                      border: '2px solid hsl(var(--color-error-border))',
                      color: 'hsl(var(--color-error-text))'
                    }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full name */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: 'hsl(var(--color-label))' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                      style={{ background: 'hsl(var(--color-input-bg))', border: '2px solid hsl(var(--color-input-border))', borderRadius: '4px', color: 'hsl(var(--color-input-text))' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-focus))'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-border))'; }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: 'hsl(var(--color-label))' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 text-sm font-medium focus:outline-none transition-colors"
                      style={{ background: 'hsl(var(--color-input-bg))', border: '2px solid hsl(var(--color-input-border))', borderRadius: '4px', color: 'hsl(var(--color-input-text))' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-focus))'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-border))'; }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: 'hsl(var(--color-label))' }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Min. 8 characters"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm font-medium focus:outline-none transition-colors"
                        style={{ background: 'hsl(var(--color-input-bg))', border: '2px solid hsl(var(--color-input-border))', borderRadius: '4px', color: 'hsl(var(--color-input-text))' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-focus))'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-border))'; }}
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--color-icon-muted))' }}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-[0.18em] mb-1.5" style={{ color: 'hsl(var(--color-label))' }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        required
                        placeholder="Re-enter password"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm font-medium focus:outline-none transition-colors"
                        style={{ background: 'hsl(var(--color-input-bg))', border: '2px solid hsl(var(--color-input-border))', borderRadius: '4px', color: 'hsl(var(--color-input-text))' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-focus))'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--color-input-border))'; }}
                      />
                      <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--color-icon-muted))' }}>
                        {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-[0.15em] transition-all disabled:opacity-60 active:translate-y-[1px] active:shadow-none"
                    style={{
                      fontFamily: 'var(--font-display)',
                      background: 'hsl(var(--color-gold))',
                      color: 'hsl(var(--color-navy-btn))',
                      border: '2.5px solid hsl(var(--color-navy-btn))',
                      borderRadius: '4px',
                      boxShadow: '3px 3px 0 hsl(var(--color-navy-btn))'
                    }}>
                    {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>

                <div className="my-4 border-t" style={{ borderColor: 'hsl(var(--color-divider-cream))' }} />

                <p className="text-center text-sm font-medium" style={{ color: 'hsl(var(--color-body-text))' }}>
                  Already have an account?{' '}
                  <Link to="/login" className="font-black uppercase tracking-wide hover:underline" style={{ color: 'hsl(var(--color-link))' }}>
                    Sign In
                  </Link>
                </p>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.22em] mt-5 opacity-50" style={{ color: 'hsl(47 100% 70%)' }}>
              Believe · Improve · Learn · Inspire · Become
            </p>
          </div>
        </div>

        {/* Bottom marquee strip */}
        <div
          className="w-full flex-shrink-0 overflow-hidden relative z-10"
          style={{ height: '28px', background: 'hsl(var(--color-gold))', borderTop: '2px solid hsl(var(--color-black-border))' }}>
          <div className="marquee-track h-full flex items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="flex items-center gap-4 px-4 text-[11px] font-black uppercase tracking-[0.22em] shrink-0" style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--color-black-border))' }}>
                <span>BELIEVE</span><span style={{ color: 'hsl(var(--color-marquee-dot))' }}>·</span>
                <span>IMPROVE</span><span style={{ color: 'hsl(var(--color-marquee-dot))' }}>·</span>
                <span>LEARN</span><span style={{ color: 'hsl(var(--color-marquee-dot))' }}>·</span>
                <span>INSPIRE</span><span style={{ color: 'hsl(var(--color-marquee-dot))' }}>·</span>
                <span>BECOME</span><span style={{ color: 'hsl(var(--color-marquee-dot))' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

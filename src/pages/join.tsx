import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { signUp, saveSessionToken } from '@/lib/auth/auth-client';
import { join } from 'virtual:content';


export default function JoinPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputStyle = {
    border: '1px solid hsl(var(--color-navy) / 0.2)',
    background: 'hsl(var(--color-page-bg))',
    color: 'hsl(var(--color-navy))',
  };

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.boxShadow = '0 0 0 2px hsl(var(--color-accent) / 0.45)';
    e.currentTarget.style.borderColor = 'hsl(var(--color-accent))';
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = 'hsl(var(--color-navy) / 0.2)';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      // 1. Check allowlist first
      const checkRes = await fetch('/api/auth/check-allowlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const checkData = await checkRes.json() as { allowed: boolean; error?: string };

      if (!checkData.allowed) {
        setError('This email address is not on the access list. Please contact the ATRC admin to be added.');
        setLoading(false);
        return;
      }

      // 2. Proceed with registration
      const result = await signUp.email({ name: name.trim(), email: email.trim(), password });
      if (result.error) {
        setError(result.error.message ?? 'Registration failed. Please try again.');
      } else {
        if (result.data?.token) {
          saveSessionToken(result.data.token);
          window.dispatchEvent(new Event('atrc-session-changed'));
        }
        navigate('/');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Join ATRC Premium — Psychology Licensure Study Platform</title>
        <meta name="description" content="Apply to join ATRC Premium PMLeBoards — the structured 100-day study platform for future Psychometricians preparing for the Philippine Mental Health Law Exam (PMLE)." />
        <link rel="canonical" href="https://atrcpremium.com/join" />
        <meta property="og:title" content="Join ATRC Premium PMLeBoards" />
        <meta property="og:description" content="Apply for access to the #1 PMLE study platform. 100 days of structured review, learning materials, leaderboard, and community." />
        <meta property="og:image" content="https://atrcpremium.com/og-image.svg" />
        <meta property="og:url" content="https://atrcpremium.com/join" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Join ATRC Premium PMLeBoards" />
        <meta name="twitter:description" content="Apply for access to the structured PMLE study platform for future Psychometricians." />
        <meta name="twitter:image" content="https://atrcpremium.com/og-image.svg" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://atrcpremium.com/join#webpage",
          "url": "https://atrcpremium.com/join",
          "name": "Join ATRC Premium — Psychology Licensure Study Platform",
          "description": "Apply to join ATRC Premium PMLeBoards, the structured 100-day PMLE study platform for future Psychometricians.",
          "isPartOf": { "@id": "https://atrcpremium.com/#website" },
          "about": { "@id": "https://atrcpremium.com/#organization" }
        }).replace(/</g, '\u003c')}</script>
      </Helmet>

      <main
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ background: 'hsl(var(--color-page-bg))' }}
      >
        {/* Radial warm glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse 70% 55% at 50% 0%, hsl(var(--color-accent) / 0.07) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        <div
          className="editorial-card relative z-10 w-full max-w-md p-8 md:p-10"
          style={{ background: 'hsl(var(--color-card-cream))' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <p className="editorial-eyebrow mb-2">{join.form.eyebrow}</p>
            <h1
              className="editorial-h2 mb-2"
              style={{ fontSize: '1.75rem' }}
            >
              {join.form.heading}
            </h1>
            <p
              className="text-xs leading-relaxed"
              style={{ color: 'hsl(var(--color-navy-mid))' }}
            >
              {join.accessNote}
            </p>
          </div>

          <div className="section-divider mb-6" />

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label
                htmlFor="join-name"
                className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                style={{ color: 'hsl(var(--color-navy))' }}
              >
                Full Name
              </label>
              <input
                id="join-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maria Santos"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="join-email"
                className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                style={{ color: 'hsl(var(--color-navy))' }}
              >
                Email Address
              </label>
              <input
                id="join-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="join-password"
                className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                style={{ color: 'hsl(var(--color-navy))' }}
              >
                Password
              </label>
              <input
                id="join-password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="join-confirm"
                className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                style={{ color: 'hsl(var(--color-navy))' }}
              >
                Confirm Password
              </label>
              <input
                id="join-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-xs rounded-lg px-3 py-2.5 leading-relaxed"
                style={{
                  background: 'hsl(0 70% 95%)',
                  color: 'hsl(0 60% 40%)',
                  border: '1px solid hsl(0 60% 85%)',
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-ink w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? join.form.loadingLabel : join.form.submitLabel}
            </button>
          </form>

          <div className="section-divider mt-6" />

          <p
            className="text-center text-xs mt-4"
            style={{ color: 'hsl(var(--color-navy-mid))' }}
          >
            <span>{join.form.signInPrompt}</span>{' '}
            <Link
              to="/login"
              className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              style={{ color: 'hsl(var(--color-accent))' }}
            >
              {join.form.signInLabel}
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

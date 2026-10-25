import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router';
import { Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { forgot_password } from 'virtual:content';

type Step = 'email' | 'otp' | 'newpassword' | 'done';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) { setError(d.error ?? 'Failed to send OTP. Please try again.'); return; }
      setStep('otp');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length !== 6) { setError('Please enter the 6-digit OTP.'); return; }
    setError('');
    setStep('newpassword');
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPw) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      });
      const d = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !d.ok) { setError(d.error ?? 'Failed to reset password.'); return; }
      setStep('done');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  const currentStep = forgot_password.steps[step];

  /* ── Shared input style helpers ── */
  const inputBase: React.CSSProperties = {
    border: '1px solid hsl(var(--color-navy) / 0.2)',
    background: 'hsl(var(--color-page-bg))',
    color: 'hsl(var(--color-navy))',
  };
  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.boxShadow = '0 0 0 2px hsl(var(--color-accent) / 0.45)';
    e.currentTarget.style.borderColor = 'hsl(var(--color-accent))';
  }
  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = 'hsl(var(--color-navy) / 0.2)';
  }

  /* ── Step progress indicator ── */
  const steps: Step[] = ['email', 'otp', 'newpassword', 'done'];
  const stepIdx = steps.indexOf(step);

  return (
    <>
      <Helmet>
        <title>Forgot Password — ATRC Premium</title>
        <meta name="description" content="Reset your ATRC Premium password using a one-time OTP sent to your email." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ background: 'hsl(var(--color-page-bg))' }}
      >
        {/* Warm radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 55% at 50% 0%, hsl(var(--color-accent) / 0.07) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        <div
          className="editorial-card relative z-10 w-full max-w-md p-8 md:p-10"
          style={{ background: 'hsl(var(--color-card-cream))' }}
        >
          {/* Back link */}
          {step !== 'done' && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:opacity-70 transition-opacity"
              style={{ color: 'hsl(var(--color-navy-mid))' }}
            >
              <ArrowLeft size={13} />
              Back to sign in
            </Link>
          )}

          {/* Step progress dots */}
          {step !== 'done' && (
            <div className="flex items-center gap-2 mb-6">
              {(['email', 'otp', 'newpassword'] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === stepIdx ? '20px' : '8px',
                      height: '8px',
                      background: i <= stepIdx
                        ? 'hsl(var(--color-accent))'
                        : 'hsl(var(--color-navy) / 0.15)',
                    }}
                  />
                  {i < 2 && (
                    <div
                      className="h-px w-6"
                      style={{
                        background: i < stepIdx
                          ? 'hsl(var(--color-accent) / 0.5)'
                          : 'hsl(var(--color-navy) / 0.12)',
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Eyebrow + heading */}
          <p className="editorial-eyebrow mb-1">{currentStep.sub}</p>
          <h1
            className="editorial-h2 mb-2"
            style={{ fontSize: '1.6rem' }}
          >
            {currentStep.label}
          </h1>
          {'desc' in currentStep && currentStep.desc && (
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: 'hsl(var(--color-navy-mid))' }}
            >
              {step === 'otp' ? `${currentStep.desc} ${email}` : currentStep.desc}
            </p>
          )}

          <div className="section-divider mb-6" />

          {/* ── Step: Email ── */}
          {step === 'email' && (
            <form onSubmit={sendOtp} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="fp-email"
                  className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                  style={{ color: 'hsl(var(--color-navy))' }}
                >
                  Email Address
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                disabled={loading}
                className="btn-ink w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {currentStep.cta}
              </button>
            </form>
          )}

          {/* ── Step: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={verifyOtp} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="fp-otp"
                  className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                  style={{ color: 'hsl(var(--color-navy))' }}
                >
                  6-Digit OTP
                </label>
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all tracking-[0.3em] text-center font-mono"
                  style={inputBase}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                className="btn-ink w-full py-3 text-sm font-semibold"
              >
                {currentStep.cta}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="btn-ghost w-full py-2.5 text-sm"
              >
                Resend OTP
              </button>
            </form>
          )}

          {/* ── Step: New Password ── */}
          {step === 'newpassword' && (
            <form onSubmit={resetPassword} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="fp-newpw"
                  className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                  style={{ color: 'hsl(var(--color-navy))' }}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="fp-newpw"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                    style={inputBase}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                    style={{ color: 'hsl(var(--color-navy))' }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="fp-confirmpw"
                  className="block text-xs font-semibold mb-1.5 tracking-wide uppercase"
                  style={{ color: 'hsl(var(--color-navy))' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="fp-confirmpw"
                    type={showConfirmPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full rounded-lg px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                    style={inputBase}
                    onFocus={onFocus}
                    onBlur={onBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80 transition-opacity"
                    style={{ color: 'hsl(var(--color-navy))' }}
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && <ErrorBox message={error} />}
              <button
                type="submit"
                disabled={loading}
                className="btn-ink w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {currentStep.cta}
              </button>
            </form>
          )}

          {/* ── Step: Done ── */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
                style={{ background: 'hsl(var(--color-accent) / 0.12)' }}
              >
                <CheckCircle2
                  size={28}
                  style={{ color: 'hsl(var(--color-accent))' }}
                />
              </div>
              {'desc' in currentStep && currentStep.desc && (
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: 'hsl(var(--color-navy-mid))' }}
                >
                  {currentStep.desc}
                </p>
              )}
              <button
                onClick={() => navigate('/login')}
                className="btn-ink w-full py-3 text-sm font-semibold"
              >
                {currentStep.cta}
              </button>
            </div>
          )}

          {/* Sign-in link */}
          {step !== 'done' && (
            <>
              <div className="section-divider mt-6" />
              <p
                className="text-center text-xs mt-4"
                style={{ color: 'hsl(var(--color-navy-mid))' }}
              >
                Remembered your password?{' '}
                <Link
                  to="/login"
                  className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: 'hsl(var(--color-accent))' }}
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p
      className="text-xs rounded-lg px-3 py-2.5 leading-relaxed"
      style={{
        background: 'hsl(0 70% 95%)',
        color: 'hsl(0 60% 40%)',
        border: '1px solid hsl(0 60% 85%)',
      }}
    >
      {message}
    </p>
  );
}

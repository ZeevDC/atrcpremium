import { Helmet } from '@dr.pogodin/react-helmet';
import { clearSessionToken } from '@/lib/auth/auth-client';
import { useNavigate } from 'react-router';
import { expired_access } from 'virtual:content';

const tapeBg = `repeating-linear-gradient(45deg,hsl(var(--color-gold)) 0,hsl(var(--color-gold)) 10px,hsl(var(--color-charcoal)) 10px,hsl(var(--color-charcoal)) 20px)`;

export default function ExpiredAccessPage({ reason = 'expired' }: { reason?: 'expired' | 'suspended' | 'pending' }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    clearSessionToken();
    navigate('/login');
  };

  const msg = reason === 'suspended'
    ? expired_access.reasons.suspended
    : reason === 'pending'
    ? expired_access.reasons.pending
    : expired_access.reasons.expired;

  return (
    <>
      <Helmet>
        <title>Access Expired — ATRC Premium PMLeBoards</title>
        <meta name="description" content="Your ATRC Premium access has expired or been suspended. Contact ATRC to renew." />
      </Helmet>
      <div className="relative min-h-screen flex items-center justify-center p-4" style={{ background: 'hsl(var(--color-navy))' }}>
        <div className="pointer-events-none fixed inset-0 z-0" style={{ background: 'conic-gradient(from 0deg at 50% 45%, hsl(var(--color-sunburst-a)) 0deg, hsl(var(--color-sunburst-b)) 20deg, hsl(var(--color-sunburst-a)) 40deg, hsl(var(--color-sunburst-b)) 60deg, hsl(var(--color-sunburst-a)) 80deg, hsl(var(--color-sunburst-b)) 100deg, hsl(var(--color-sunburst-a)) 120deg, hsl(var(--color-sunburst-b)) 140deg, hsl(var(--color-sunburst-a)) 160deg, hsl(var(--color-sunburst-b)) 180deg, hsl(var(--color-sunburst-a)) 200deg, hsl(var(--color-sunburst-b)) 220deg, hsl(var(--color-sunburst-a)) 240deg, hsl(var(--color-sunburst-b)) 260deg, hsl(var(--color-sunburst-a)) 280deg, hsl(var(--color-sunburst-b)) 300deg, hsl(var(--color-sunburst-a)) 320deg, hsl(var(--color-sunburst-b)) 340deg, hsl(var(--color-sunburst-a)) 360deg)', opacity: 0.85 }} />
        <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle, hsl(var(--color-halftone-dot)) 1px, transparent 1px)', backgroundSize: '12px 12px', opacity: 0.18 }} />
        <div className="fixed top-0 left-0 right-0 z-10" style={{ height: 8, background: tapeBg }} />

        <div className="relative z-10 w-full max-w-md">
          <div style={{ background: 'hsl(var(--color-card-cream))', border: '3px solid hsl(var(--color-black-border))', borderRadius: '12px', boxShadow: '6px 6px 0 hsl(var(--color-black-border))', overflow: 'hidden' }}>
            <div className="px-6 py-4 text-center" style={{ background: 'hsl(var(--color-gold))', borderBottom: '3px solid hsl(var(--color-black-border))' }}>
              <div className="text-4xl mb-1"><span>{msg.emoji}</span></div>
              <h1 className="font-black uppercase text-base tracking-wide" style={{ fontFamily: "'Playfair Display', serif", color: 'hsl(var(--color-navy))', fontWeight: 500 }}>
                <span>{msg.title}</span>
              </h1>
            </div>
            <div className="p-6 space-y-5 text-center">
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--color-body-text))' }}>
                <span>{msg.body}</span>
              </p>
              <div className="p-4 rounded-lg" style={{ background: 'hsl(var(--color-navy-mid))', border: '2px solid hsl(var(--color-gold) / 0.4)' }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--color-gold))' }}>
                  <span>{expired_access.contactLabel}</span>
                </p>
                <a href={`mailto:${expired_access.contactEmail}`} className="text-sm font-bold" style={{ color: 'hsl(var(--color-gold))' }}>
                  <span>{expired_access.contactEmail}</span>
                </a>
              </div>
              <p className="text-xs" style={{ color: 'hsl(var(--color-body-muted))' }}>
                <span>{expired_access.dataPreservedNote}</span>
              </p>
              <button
                onClick={handleSignOut}
                className="w-full py-3 font-black uppercase text-sm rounded transition-all"
                style={{ background: 'hsl(var(--color-gold))', color: 'hsl(var(--color-black-border))', border: '2.5px solid hsl(var(--color-black-border))', boxShadow: '3px 3px 0 hsl(var(--color-black-border))', fontFamily: 'var(--font-display)' }}
              >
                <span>{expired_access.signOutButton}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

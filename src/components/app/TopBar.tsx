import { HelpCircle, Menu, LogOut, LogIn } from 'lucide-react';
import { useSession, clearSessionToken } from '@/lib/auth/auth-client';

interface TopBarProps {
  onMenuToggle: () => void;
  onLoginClick: () => void;
}

/**
 * TopBar — Scholarly editorial style.
 * Paper background with backdrop blur, hairline bottom border. No tape strip.
 */
export default function TopBar({ onMenuToggle, onLoginClick }: TopBarProps) {
  const { data: session } = useSession();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Main header bar — paper + blur */}
      <header
        className="relative flex items-center justify-between px-3 md:px-5 backdrop-blur-sm"
        style={{
          height: '52px',
          background: 'hsl(var(--color-page-bg) / 0.92)',
          borderBottom: '1px solid hsl(var(--color-hairline))',
          boxShadow: '0 1px 0 hsl(var(--color-navy) / 0.06)',
        }}
      >
        {/* Left: hamburger + logo */}
        <div className="relative flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuToggle}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'hsl(var(--color-navy) / 0.5)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--color-navy))'; e.currentTarget.style.background = 'hsl(var(--color-navy) / 0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(var(--color-navy) / 0.5)'; e.currentTarget.style.background = 'transparent'; }}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-full overflow-hidden shrink-0"
              style={{
                width: '30px',
                height: '30px',
                background: 'hsl(var(--color-navy))',
                boxShadow: '0 1px 3px hsl(var(--color-navy) / 0.25)',
              }}
            >
              <img
                src="/airo-assets/images/logo/horizontal/light"
                alt="ATRC"
                className="h-auto object-contain"
                style={{ maxHeight: '18px', width: 'auto' }}
              />
            </div>
            <div className="hidden sm:flex flex-col leading-none gap-0.5">
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'hsl(var(--color-navy))',
                  letterSpacing: '-0.01em',
                }}
              >
                ATRC
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '9px',
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase' as const,
                  color: 'hsl(var(--color-accent))',
                }}
              >
                Premium
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right: actions */}
        <div className="relative flex items-center gap-1">

          <button
            className="hidden sm:flex p-1.5 rounded-lg transition-colors"
            style={{ color: 'hsl(var(--color-navy) / 0.40)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--color-navy))'; e.currentTarget.style.background = 'hsl(var(--color-navy) / 0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(var(--color-navy) / 0.40)'; e.currentTarget.style.background = 'transparent'; }}
            aria-label="Help"
          >
            <HelpCircle size={15} />
          </button>

          {session?.user ? (
            <div className="flex items-center gap-2 ml-1">
              <span
                className="hidden sm:block text-[11px] font-medium max-w-[110px] truncate"
                style={{ color: 'hsl(var(--color-body-muted))' }}
              >
                {session.user.name ?? session.user.email}
              </span>
              <button
                onClick={() => { clearSessionToken(); window.location.href = '/login'; }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold transition-all rounded-lg"
                style={{
                  color: 'hsl(var(--color-body-muted))',
                  border: '1px solid hsl(var(--color-hairline))',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--color-navy))';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--color-navy) / 0.30)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--color-navy) / 0.05)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--color-body-muted))';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--color-hairline))';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
                title="Sign out"
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-3 py-1.5 ml-1 text-[11px] font-semibold transition-all rounded-lg"
              style={{
                background: 'hsl(var(--color-navy))',
                color: 'hsl(var(--color-page-bg))',
                boxShadow: '0 1px 3px hsl(var(--color-navy) / 0.25)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.12)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--color-navy))'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
            >
              <LogIn size={12} />
              <span className="hidden sm:inline">Log In</span>
            </button>
          )}
        </div>
      </header>
    </div>
  );
}

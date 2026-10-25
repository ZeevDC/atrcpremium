import { useState, type ReactNode } from 'react';
import TopBar from '@/components/app/TopBar';
import Sidebar from '@/components/app/Sidebar';
import { useAccessCheck } from '@/hooks/useAccessCheck';
import ExpiredAccessPage from '@/pages/expired-access';

interface AppShellProps {
  children: ReactNode;
  activeSection?: string;
}

/**
 * AppShell — Scholarly editorial style.
 * Warm paper background, deep navy sidebar, restrained gold accent.
 * Paper grain texture is applied via globals.css body::before.
 */
export default function AppShell({ children, activeSection = '' }: AppShellProps) {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [section, setSection] = useState(activeSection);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const access = useAccessCheck();

  const sidebarPush = typeof window !== 'undefined' && window.innerWidth >= 768;
  const sidebarWidth = sidebarOpen && sidebarPush ? 'var(--sidebar-width)' : sidebarOpen && !sidebarPush ? '0px' : 'var(--sidebar-width-collapsed)';

  if (access.status === 'expired') return <ExpiredAccessPage reason="expired" />;
  if (access.status === 'suspended') return <ExpiredAccessPage reason="suspended" />;
  if (access.status === 'pending') return <ExpiredAccessPage reason="pending" />;

  const showExpiryBanner =
    !bannerDismissed &&
    access.status === 'expiring_soon' &&
    access.daysRemaining !== null &&
    !access.isAdmin;

  return (
    <div className="storybook-shell relative min-h-screen">
      {/* Expiry warning banner */}
      {showExpiryBanner && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4 py-2 text-xs font-medium"
          style={{
            background: 'hsl(43 72% 47%)',
            color: 'hsl(222 50% 12%)',
            borderBottom: '1px solid hsl(222 50% 16% / 0.20)',
          }}
        >
          <span>Your access expires in {access.daysRemaining} day{access.daysRemaining === 1 ? '' : 's'}. Please contact ATRC to renew.</span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="ml-4 opacity-60 hover:opacity-100 transition-opacity"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            ✕
          </button>
        </div>
      )}

      <TopBar
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        onLoginClick={() => {}}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        activeSection={section}
        onSectionChange={setSection}
      />

      <main
        className="storybook-main relative z-10 transition-all duration-300 overflow-y-auto"
        style={{
          marginTop: showExpiryBanner ? 'calc(var(--topbar-height) + 32px)' : 'var(--topbar-height)',
          marginLeft: sidebarWidth,
          minHeight: 'calc(100vh - var(--topbar-height))',
          paddingBottom: '52px',
        }}
      >
        {children}
      </main>

      {/* Bottom marquee strip — editorial ink on paper */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 overflow-hidden"
        style={{
          height: '28px',
          background: 'hsl(var(--color-navy))',
          borderTop: '1px solid hsl(222 50% 16% / 0.20)',
        }}
      >
        <div className="marquee-track h-full flex items-center">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-4 px-4 shrink-0"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '9px',
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase' as const,
                color: 'hsl(0 0% 100% / 0.35)',
                whiteSpace: 'nowrap' as const,
              }}
            >
              <span>BELIEVE</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>IMPROVE</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>LEARN</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>INSPIRE</span>
              <span style={{ opacity: 0.3 }}>·</span>
              <span>BECOME</span>
              <span style={{ opacity: 0.3 }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

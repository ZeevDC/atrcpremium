import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useSession } from '@/lib/auth/auth-client';
import {
  Home, User, ClipboardList, Trophy, Award,
  Settings, BookOpen, CalendarDays, CheckSquare
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: 'home',              icon: Home,         label: 'Home',               href: '/',                   group: null },
  { id: 'profile',           icon: User,         label: 'Profile',            href: '/profile',            group: 'Profile' },
  { id: 'study-planner',     icon: CalendarDays, label: 'Study Planner',      href: '/study-planner',      group: 'Study Planner' },
  { id: 'logs',              icon: ClipboardList,label: 'WeBILIB Logs',       href: '/logs',               group: 'WeBILIB Logs' },
  { id: 'tos-tracker',       icon: CheckSquare,  label: 'TOS Tracker',        href: '/tos-tracker',        group: 'TOS Tracker' },
  { id: 'learning-materials',icon: BookOpen,     label: 'Learning Materials', href: '/learning-materials', group: 'Learning Materials' },
  { id: 'leaderboard',       icon: Trophy,       label: 'Leaderboard',        href: '/leaderboard',        group: 'Leaderboard' },
  { id: 'achievements',      icon: Award,        label: 'Achievements',       href: '/achievements',       group: 'Achievements' },
  { id: 'admin',             icon: Settings,     label: 'Admin Panel',        href: '/admin',              group: null },
];

const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

export default function Sidebar({ isOpen, onToggle, activeSection, onSectionChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL;

  const resolvedActive = (() => {
    const match = navItems.find(item => item.href && item.href !== '/' && location.pathname.startsWith(item.href));
    if (match) return match.id;
    if (location.pathname === '/') return 'home';
    return activeSection;
  })();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <aside
        className="fixed left-0 z-40 flex flex-col transition-all duration-300 overflow-hidden"
        style={{
          top: 'var(--topbar-height)',
          bottom: 0,
          width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-width-collapsed)',
          background: 'hsl(var(--color-sidebar-bg, var(--color-navy)))',
          borderRight: '1px solid hsl(var(--color-navy) / 0.80)',
        }}
      >
        {/* Section label */}
        {isOpen && (
          <div
            className="px-4 pt-5 pb-3"
            style={{ borderBottom: '1px solid hsl(var(--color-sidebar-text, var(--color-page-bg)) / 0.10)' }}
          >
            <span className="editorial-eyebrow" style={{ color: 'hsl(var(--color-sidebar-text, var(--color-page-bg)) / 0.45)' }}>
              § Navigation
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav className="relative flex-1 overflow-y-auto overflow-x-hidden py-2" aria-label="Main navigation">
          {navItems.filter((item) => item.id !== 'admin' || isAdmin).map((item) => {
            const Icon = item.icon;
            const isActive = resolvedActive === item.id;
            const showTooltip = !isOpen && hoveredItem === item.id;
            return (
              <div key={item.id} className="relative px-2 py-0.5">
                <button
                  onClick={() => {
                    if (item.href) { navigate(item.href); } else { onSectionChange(item.id); }
                    if (typeof window !== 'undefined' && window.innerWidth < 768) { onToggle(); }
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left"
                  style={{
                    color: isActive ? 'hsl(var(--color-accent))' : 'hsl(var(--color-sidebar-text, var(--color-page-bg)) / 0.65)',
                    background: isActive ? 'hsl(var(--color-accent))' : hoveredItem === item.id ? 'hsl(var(--color-page-bg) / 0.06)' : 'transparent',
                    borderLeft: isActive ? '2px solid hsl(var(--color-navy))' : '2px solid transparent',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    style={{ color: isActive ? 'hsl(var(--color-navy))' : 'hsl(var(--color-sidebar-text, var(--color-page-bg)) / 0.55)', flexShrink: 0 }}
                  />
                  {isOpen && (
                    <span
                      className="text-[12px] font-medium truncate"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: '0.01em',
                        color: isActive ? 'hsl(var(--color-navy))' : 'hsl(var(--color-sidebar-text, var(--color-page-bg)) / 0.75)',
                        fontWeight: isActive ? 700 : 500,
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>

                {/* Tooltip for collapsed state */}
                {showTooltip && !isOpen && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap z-50 pointer-events-none rounded-lg"
                    style={{
                      background: 'hsl(var(--color-sidebar-bg, var(--color-navy)))',
                      color: 'hsl(var(--color-sidebar-text, var(--color-page-bg)) / 0.90)',
                      border: '1px solid hsl(var(--color-page-bg) / 0.12)',
                      boxShadow: '0 4px 16px hsl(var(--color-navy) / 0.40)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>


      </aside>
    </>
  );
}

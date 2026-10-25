import { type ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSession } from '@/lib/auth/auth-client';
import { getSessionToken } from '@/lib/auth/auth-client';
import { Loader2 } from 'lucide-react';

type TokenUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
};

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  // Fallback: token-based session for iframe/preview where cookies are blocked
  const [tokenUser, setTokenUser] = useState<TokenUser | null | undefined>(undefined);
  const [tokenChecked, setTokenChecked] = useState(false);

  useEffect(() => {
    if (isPending) return; // wait for cookie-based check first
    if (session?.user) { setTokenChecked(true); return; } // cookie session works, skip

    const token = getSessionToken();
    if (!token) { setTokenUser(null); setTokenChecked(true); return; }

    fetch('/api/auth/session-token', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setTokenUser(data?.user ?? null);
        setTokenChecked(true);
      })
      .catch(() => { setTokenUser(null); setTokenChecked(true); });
  }, [isPending, session]);

  // Still loading
  if (isPending || !tokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="flex flex-col items-center gap-3">
          <img src="/airo-assets/images/logo/horizontal" alt="ATRC" className="h-10 w-10 object-contain" />
          <Loader2 size={24} className="animate-spin" style={{ color: 'hsl(var(--color-gold))' }} />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  // Not authenticated via either method
  if (!session?.user && !tokenUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

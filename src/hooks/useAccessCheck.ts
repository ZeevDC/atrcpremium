import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth/auth-client';

export type AccessStatus = 'loading' | 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'pending' | 'admin';

export interface AccessInfo {
  status: AccessStatus;
  daysRemaining: number | null;
  expiryDate: string | null;
  planType: string | null;
  isAdmin: boolean;
}

const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

export function useAccessCheck(): AccessInfo {
  const { data: session, isPending } = useSession();
  const [info, setInfo] = useState<AccessInfo>({
    status: 'loading',
    daysRemaining: null,
    expiryDate: null,
    planType: null,
    isAdmin: false,
  });

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      setInfo({ status: 'loading', daysRemaining: null, expiryDate: null, planType: null, isAdmin: false });
      return;
    }

    // Admin always active
    if (session.user.email?.toLowerCase() === ADMIN_EMAIL) {
      setInfo({ status: 'admin', daysRemaining: null, expiryDate: null, planType: null, isAdmin: true });
      return;
    }

    // Fetch from API using session token
    const token = session.session?.token;
    if (!token) return;

    fetch('/api/access/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: { status: string; daysRemaining: number | null; expiryDate: string | null; planType: string | null; isAdmin: boolean }) => {
        setInfo({
          status: data.status as AccessStatus,
          daysRemaining: data.daysRemaining,
          expiryDate: data.expiryDate,
          planType: data.planType,
          isAdmin: data.isAdmin,
        });
      })
      .catch(() => {
        // On error, allow access (fail open) to avoid locking out on network issues
        setInfo({ status: 'active', daysRemaining: null, expiryDate: null, planType: null, isAdmin: false });
      });
  }, [session, isPending]);

  return info;
}

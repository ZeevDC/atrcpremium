import { createAuthClient } from 'better-auth/react';
import { useState, useEffect, useCallback, type ReactNode } from 'react';

const _origin = typeof window !== 'undefined' ? window.location.origin : '';

const TOKEN_KEY = 'atrc_session_token';

export function saveSessionToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token); } catch { /* ignore */ }
}

export function clearSessionToken() {
  try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
}

export function getSessionToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export const authClient = createAuthClient({
  baseURL: _origin,
  fetchOptions: {
    credentials: 'include',
    onRequest(context: { headers: Headers }) {
      if (typeof window === 'undefined') return;
      context.headers.set('Origin', window.location.origin);
      const token = getSessionToken();
      if (token) context.headers.set('Authorization', `Bearer ${token}`);
    },
  },
});

export const { signIn, signOut } = authClient;

// ── Custom useSession that works with localStorage token ──────────────────────
// BetterAuth's built-in useSession relies on cookies which may be blocked in
// iframes or cross-origin contexts. This hook uses the stored Bearer token
// and our /api/auth/session-token endpoint instead.

interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SessionData {
  session: { id: string; userId: string; expiresAt: string; token?: string };
  user: SessionUser;
}

interface UseSessionResult {
  data: SessionData | null;
  isPending: boolean;
  refetch: () => void;
}

let _sessionCache: SessionData | null = null;
let _sessionListeners: Array<() => void> = [];

function notifyListeners() {
  _sessionListeners.forEach(fn => fn());
}

export function useSession(): UseSessionResult {
  const [data, setData] = useState<SessionData | null>(_sessionCache);
  const [isPending, setIsPending] = useState(_sessionCache === null);

  const fetchSession = useCallback(async () => {
    const token = getSessionToken();
    if (!token) {
      _sessionCache = null;
      setData(null);
      setIsPending(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/session-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        clearSessionToken();
        _sessionCache = null;
        setData(null);
      } else {
        const json = (await res.json()) as SessionData;
        // Attach the token so downstream code (useAccessCheck) can read it
        json.session = { ...json.session, token };
        _sessionCache = json;
        setData(json);
      }
    } catch {
      _sessionCache = null;
      setData(null);
    } finally {
      setIsPending(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    _sessionListeners.push(fetchSession);
    // Also listen for manual session-changed events (e.g. after login)
    window.addEventListener('atrc-session-changed', fetchSession);
    return () => {
      _sessionListeners = _sessionListeners.filter(fn => fn !== fetchSession);
      window.removeEventListener('atrc-session-changed', fetchSession);
    };
  }, [fetchSession]);

  return { data, isPending, refetch: fetchSession };
}

// signUp wrapper that also saves the token
export const signUp = {
  email: async (params: { email: string; password: string; name: string }) => {
    const res = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: _origin },
      credentials: 'include',
      body: JSON.stringify(params),
    });
    const data = await res.json() as { token?: string; error?: { message?: string } };
    if (data.token) {
      saveSessionToken(data.token);
      notifyListeners();
    }
    return { data: res.ok ? data : null, error: res.ok ? null : (data.error ?? { message: 'Sign up failed' }) };
  },
};

export function LogoutButton({ className, children }: { className?: string; children?: ReactNode }) {
  const handleLogout = async () => {
    clearSessionToken();
    _sessionCache = null;
    notifyListeners();
    try {
      await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include', headers: { Origin: _origin } });
    } catch { /* ignore */ }
    window.location.href = '/login';
  };
  return (
    <button onClick={handleLogout} className={className}>
      {children ?? 'Sign Out'}
    </button>
  );
}

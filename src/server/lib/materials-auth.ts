/**
 * Shared auth helpers for materials endpoints.
 * - resolveSession: validates Bearer token, returns { userId, isAdmin }
 * - requireActiveAccess: checks student_access is active or expiring_soon
 * - signToken / verifyToken: short-lived HMAC-SHA256 tokens for file serving
 */
import type { Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { db } from '../db/client.js';
import { session, user } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAccessRecord, computeStatus, ADMIN_EMAIL } from './access-helpers.js';
import { getSecret } from '#airo/secrets';

// ── Session resolution ────────────────────────────────────────────────────────

export interface SessionInfo {
  userId: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Reads the Bearer token from Authorization header, validates it against the
 * session table, and returns session info. Sends 401 and returns null on failure.
 */
export async function resolveSession(
  req: Request,
  res: Response,
): Promise<SessionInfo | null> {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }

  const sessions = await db.select().from(session).where(eq(session.token, token));
  if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) {
    res.status(401).json({ error: 'Session expired or invalid' });
    return null;
  }

  const userId = sessions[0].userId;
  const users = await db.select().from(user).where(eq(user.id, userId));
  if (!users.length) {
    res.status(401).json({ error: 'User not found' });
    return null;
  }

  const u = users[0];
  const isAdmin = Boolean(u.isAdmin) || (u.email?.toLowerCase() === ADMIN_EMAIL);

  return { userId, email: u.email ?? '', isAdmin };
}

// ── Active-access guard ───────────────────────────────────────────────────────

/**
 * Returns true if the student has active or expiring_soon access.
 * Admins always pass. Sends 403 and returns false on failure.
 */
export async function requireActiveAccess(
  res: Response,
  info: SessionInfo,
): Promise<boolean> {
  if (info.isAdmin) return true;

  const access = await getAccessRecord(info.userId);
  if (!access) {
    res.status(403).json({ error: 'No active access. Please contact your admin.' });
    return false;
  }

  const status = computeStatus(access.status, access.expiryDate);
  if (status !== 'active' && status !== 'expiring_soon') {
    res.status(403).json({ error: 'Access expired or suspended.' });
    return false;
  }

  return true;
}

// ── Short-lived file-serve tokens ─────────────────────────────────────────────

const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

function hmacSecret(): string {
  const s = getSecret('BETTER_AUTH_SECRET');
  return typeof s === 'string' ? s : 'dev-fallback-secret';
}

/**
 * Creates a signed token: base64url(JSON payload) + "." + HMAC-SHA256 sig
 * Payload: { materialId, userId, exp }
 */
export function signMaterialToken(materialId: string, userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ materialId, userId, exp: Date.now() + TOKEN_TTL_MS }),
  ).toString('base64url');
  const sig = createHmac('sha256', hmacSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export interface TokenPayload {
  materialId: string;
  userId: string;
  exp: number;
}

/**
 * Verifies the token signature and expiry. Returns the payload or null.
 */
export function verifyMaterialToken(token: string): TokenPayload | null {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', hmacSecret()).update(payload).digest('base64url');

  try {
    const a = Buffer.from(sig, 'base64url');
    const b = Buffer.from(expected, 'base64url');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let parsed: TokenPayload;
  try {
    parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
  } catch {
    return null;
  }

  if (Date.now() > parsed.exp) return null;
  return parsed;
}

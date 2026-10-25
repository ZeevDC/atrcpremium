import type { Request, Response, NextFunction } from 'express';
import { db } from '../../../server/db/client.js';
import { session, user } from '../../../server/db/schema.js';
import { eq } from 'drizzle-orm';

const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

/**
 * requireAdmin — validates the Bearer token from the Authorization header
 * and checks that the user is the admin email (or has isAdmin flag).
 * Uses the same localStorage-token approach as the rest of the app.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sessions = await db.select().from(session).where(eq(session.token, token));
    if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    const users = await db.select().from(user).where(eq(user.id, sessions[0].userId));
    if (!users.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const u = users[0];
    const isAdmin = Boolean(u.isAdmin) || (u.email?.toLowerCase() === ADMIN_EMAIL);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: admin access only' });
    }

    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

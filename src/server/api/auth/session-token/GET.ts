import type { Request, Response } from 'express';
import { db } from '../../../../server/db/client.js';
import { session, user } from '../../../../server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/session-token
 * Accepts Authorization: Bearer <token> and returns the session user.
 * Used by the client in iframe/preview environments where cookies are blocked.
 */
export default async function handler(req: Request, res: Response) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token' });
  }
  const token = auth.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const rows = await db
      .select({
        sessionId: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        userName: user.name,
        userEmail: user.email,
        userEmailVerified: user.emailVerified,
        userImage: user.image,
        userCreatedAt: user.createdAt,
        userUpdatedAt: user.updatedAt,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .where(eq(session.token, token))
      .limit(1);

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid token' });

    const row = rows[0];
    if (new Date(row.expiresAt) < new Date()) {
      return res.status(401).json({ error: 'Token expired' });
    }

    return res.json({
      session: { id: row.sessionId, userId: row.userId, expiresAt: row.expiresAt },
      user: {
        id: row.userId,
        name: row.userName,
        email: row.userEmail,
        emailVerified: row.userEmailVerified,
        image: row.userImage,
        createdAt: row.userCreatedAt,
        updatedAt: row.userUpdatedAt,
      },
    });
  } catch (err) {
    console.error('session-token lookup error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

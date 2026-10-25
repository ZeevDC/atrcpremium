import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { user, session } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { getAccessRecord, computeStatus, daysRemaining, ADMIN_EMAIL } from '../../../lib/access-helpers.js';

export default async function handler(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization ?? '';
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const sessions = await db.select().from(session).where(eq(session.token, token));
    if (!sessions.length) return res.status(401).json({ error: 'Invalid session' });
    const sess = sessions[0];
    if (new Date(sess.expiresAt) < new Date()) return res.status(401).json({ error: 'Session expired' });

    const userId = sess.userId;
    const users = await db.select().from(user).where(eq(user.id, userId));
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    const userRow = users[0];

    if (userRow.email?.toLowerCase() === ADMIN_EMAIL) {
      return res.json({ status: 'active', isAdmin: true, daysRemaining: null, expiryDate: null, planType: null });
    }

    const access = await getAccessRecord(userId);
    if (!access) {
      return res.json({ status: 'pending', isAdmin: false, daysRemaining: null, expiryDate: null, planType: null });
    }

    const liveStatus = computeStatus(access.status, access.expiryDate);
    const days = daysRemaining(access.expiryDate);

    return res.json({
      status: liveStatus,
      isAdmin: false,
      daysRemaining: days,
      expiryDate: access.expiryDate,
      planType: access.planType,
    });
  } catch (err) {
    console.error('access.me.get.failed', err);
    return res.status(500).json({ error: 'Failed to check access' });
  }
}

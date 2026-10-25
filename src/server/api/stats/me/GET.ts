import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { session, userStats } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = await db.select().from(session).where(eq(session.token, token));
    if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) return res.status(401).json({ error: 'Invalid session' });
    const userId = sessions[0].userId;

    const rows = await db.select().from(userStats).where(eq(userStats.userId, userId));
    if (!rows.length) {
      return res.json({
        totalHours: 0, streakDays: 0, rank: 0,
        hoursAbnormal: 0, hoursAssessment: 0, hoursIo: 0, hoursDevelopmental: 0,
      });
    }
    const s = rows[0];
    return res.json({
      totalHours:          parseFloat(s.totalHours),
      streakDays:          parseInt(s.streakDays),
      rank:                parseInt(s.rank),
      hoursAbnormal:       parseFloat(s.hoursAbnormal),
      hoursAssessment:     parseFloat(s.hoursAssessment),
      hoursIo:             parseFloat(s.hoursIo),
      hoursDevelopmental:  parseFloat(s.hoursDevelopmental),
    });
  } catch (err) {
    console.error('stats.me.get.failed', err);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { session, userStats, user } from '../../db/schema.js';
import { eq, asc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = await db.select().from(session).where(eq(session.token, token));
    if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) return res.status(401).json({ error: 'Invalid session' });

    // Join user_stats with user to get names; sort by rank ascending
    const rows = await db
      .select({
        userId:            userStats.userId,
        name:              user.name,
        email:             user.email,
        totalHours:        userStats.totalHours,
        streakDays:        userStats.streakDays,
        rank:              userStats.rank,
        hoursAbnormal:     userStats.hoursAbnormal,
        hoursAssessment:   userStats.hoursAssessment,
        hoursIo:           userStats.hoursIo,
        hoursDevelopmental:userStats.hoursDevelopmental,
      })
      .from(userStats)
      .innerJoin(user, eq(userStats.userId, user.id))
      .orderBy(asc(userStats.rank));

    const leaders = rows.map((r) => ({
      userId:            r.userId,
      name:              r.name ?? r.email ?? 'Anonymous',
      totalHours:        parseFloat(r.totalHours),
      streakDays:        parseInt(r.streakDays),
      rank:              parseInt(r.rank),
      hoursAbnormal:     parseFloat(r.hoursAbnormal),
      hoursAssessment:   parseFloat(r.hoursAssessment),
      hoursIo:           parseFloat(r.hoursIo),
      hoursDevelopmental:parseFloat(r.hoursDevelopmental),
    }));

    return res.json({ leaders });
  } catch (err) {
    console.error('leaderboard.get.failed', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

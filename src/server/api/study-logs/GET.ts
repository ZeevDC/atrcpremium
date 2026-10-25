import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { session, studyLogs } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = await db.select().from(session).where(eq(session.token, token));
    if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) return res.status(401).json({ error: 'Invalid session' });
    const userId = sessions[0].userId;

    const rows = await db.select().from(studyLogs)
      .where(eq(studyLogs.userId, userId))
      .orderBy(desc(studyLogs.date));

    return res.json({ logs: rows });
  } catch (err) {
    console.error('study-logs.get.failed', err);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { session, studyLogs } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { recomputeStats, recomputeRanks } from '../../../lib/stats-helpers.js';

export default async function handler(req: Request, res: Response) {
  try {
    const token = (req.headers.authorization ?? '').replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessions = await db.select().from(session).where(eq(session.token, token));
    if (!sessions.length || new Date(sessions[0].expiresAt) < new Date()) return res.status(401).json({ error: 'Invalid session' });
    const userId = sessions[0].userId;

    const { id } = req.params as { id: string };
    const existing = await db.select().from(studyLogs).where(and(eq(studyLogs.id, id), eq(studyLogs.userId, userId)));
    if (!existing.length) return res.status(404).json({ error: 'Log not found' });

    await db.delete(studyLogs).where(eq(studyLogs.id, id));
    await recomputeStats(userId);
    await recomputeRanks();

    return res.json({ ok: true });
  } catch (err) {
    console.error('study-logs.delete.failed', err);
    return res.status(500).json({ error: 'Failed to delete log' });
  }
}

import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { session, studyLogs } from '../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { recomputeStats, recomputeRanks } from '../../../lib/stats-helpers.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import multer from 'multer';

const upload = multer({ dest: '/tmp/atrc-proof/' });
export const multerMiddleware = upload.single('proof');

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

    const { subject, hours, date, notes } = req.body as { subject?: string; hours?: string; date?: string; notes?: string };
    const updates: Record<string, string | null> = {};
    if (subject) updates.subject = subject;
    if (hours) { const h = parseFloat(hours); if (!isNaN(h) && h > 0) updates.hours = String(h); }
    if (date) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `proof-${userId}-${Date.now()}${ext}`;
      const destDir = '/shared-storage/public/assets/proof/';
      await fs.mkdir(destDir, { recursive: true });
      const dest = destDir + filename;
      await fs.rename(req.file.path, dest);
      updates.proofPath = dest;
      updates.proofUrl = `/airo-assets/uploads/proof/${filename}`;
    }

    if (Object.keys(updates).length) {
      await db.update(studyLogs).set(updates).where(eq(studyLogs.id, id));
    }
    await recomputeStats(userId);
    await recomputeRanks();

    const updated = await db.select().from(studyLogs).where(eq(studyLogs.id, id));
    return res.json({ log: updated[0] });
  } catch (err) {
    console.error('study-logs.patch.failed', err);
    return res.status(500).json({ error: 'Failed to update log' });
  }
}

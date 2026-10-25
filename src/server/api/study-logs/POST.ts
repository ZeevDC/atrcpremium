import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { session, studyLogs } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { recomputeStats, recomputeRanks } from '../../lib/stats-helpers.js';
import { randomUUID } from 'node:crypto';
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

    const { subject, hours, date, notes } = req.body as { subject: string; hours: string; date: string; notes?: string };
    if (!subject || !hours || !date) return res.status(400).json({ error: 'subject, hours, date required' });
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return res.status(400).json({ error: 'Invalid hours' });

    let proofPath: string | null = null;
    let proofUrl: string | null = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `proof-${userId}-${Date.now()}${ext}`;
      const destDir = '/shared-storage/public/assets/proof/';
      await fs.mkdir(destDir, { recursive: true });
      const dest = destDir + filename;
      await fs.rename(req.file.path, dest);
      proofPath = dest;
      proofUrl = `/airo-assets/uploads/proof/${filename}`;
    }

    const id = randomUUID();
    await db.insert(studyLogs).values({ id, userId, subject, hours: String(h), date, notes: notes ?? '', proofPath, proofUrl });
    await recomputeStats(userId);
    await recomputeRanks();

    const inserted = await db.select().from(studyLogs).where(eq(studyLogs.id, id));
    return res.status(201).json({ log: inserted[0] });
  } catch (err) {
    console.error('study-logs.post.failed', err);
    return res.status(500).json({ error: 'Failed to create log' });
  }
}

// Step 8: Record an anti-capture strike for a student
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { studentStrikes } from '../../../../db/schema.js';
import { count, sql } from 'drizzle-orm';
import { resolveSession, requireActiveAccess } from '../../../../lib/materials-auth.js';

const MAX_STRIKES = 3;

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;
    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const materialId = req.params.id;
    const { reason } = req.body as { reason?: string };

    await db.insert(studentStrikes).values({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      materialId: String(materialId),
      userId: String(info.userId),
      reason: reason ?? 'screen_capture',
    });

    const [{ value: strikeCount }] = await db
      .select({ value: count() })
      .from(studentStrikes)
      .where(sql`${studentStrikes.materialId} = ${materialId} AND ${studentStrikes.userId} = ${info.userId}`);

    const locked = Number(strikeCount) >= MAX_STRIKES;
    res.json({ strikes: Number(strikeCount), locked, maxStrikes: MAX_STRIKES });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record strike.', message: String(error) });
  }
}

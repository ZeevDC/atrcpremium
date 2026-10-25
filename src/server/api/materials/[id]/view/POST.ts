// Step 9: Record a material view (for admin analytics)
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { materialViews } from '../../../../db/schema.js';
import { resolveSession, requireActiveAccess } from '../../../../lib/materials-auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;
    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const materialId = String(req.params.id);
    await db.insert(materialViews).values({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      materialId: materialId,
      userId: String(info.userId),
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record view.', message: String(error) });
  }
}

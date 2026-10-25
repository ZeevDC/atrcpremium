// Step 9: Toggle bookmark for a material
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { materialBookmarks } from '../../../../db/schema.js';
import { sql } from 'drizzle-orm';
import { resolveSession, requireActiveAccess } from '../../../../lib/materials-auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;
    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const materialId = req.params.id;
    const condition = sql`${materialBookmarks.materialId} = ${materialId} AND ${materialBookmarks.userId} = ${info.userId}`;
    const [existing] = await db.select().from(materialBookmarks).where(condition);

    if (existing) {
      await db.delete(materialBookmarks).where(condition);
      res.json({ bookmarked: false });
    } else {
      await db.insert(materialBookmarks).values({
        id: Date.now().toString(),
        materialId: String(materialId),
        userId: String(info.userId),
      });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle bookmark.', message: String(error) });
  }
}

// Step 9: Get all bookmarked material IDs for the current user
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { materialBookmarks } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveSession, requireActiveAccess } from '../../../lib/materials-auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;
    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const rows = await db.select().from(materialBookmarks).where(eq(materialBookmarks.userId, info.userId));
    res.json({ bookmarks: rows.map(r => r.materialId) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load bookmarks.', message: String(error) });
  }
}

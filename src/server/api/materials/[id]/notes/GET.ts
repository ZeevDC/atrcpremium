// Step 9: Student notes per material
import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { materialNotes } from '../../../../db/schema.js';
import { sql } from 'drizzle-orm';
import { resolveSession, requireActiveAccess } from '../../../../lib/materials-auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;
    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const materialId = req.params.id;
    const [note] = await db.select().from(materialNotes)
      .where(sql`${materialNotes.materialId} = ${materialId} AND ${materialNotes.userId} = ${info.userId}`);

    res.json({ content: note?.content ?? '' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load notes.', message: String(error) });
  }
}

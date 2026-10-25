// Step 9: Save/update student notes per material (upsert)
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
    const { content } = req.body as { content?: string };
    if (content === undefined) return res.status(400).json({ error: 'content is required.' });

    const condition = sql`${materialNotes.materialId} = ${materialId} AND ${materialNotes.userId} = ${info.userId}`;
    const [existing] = await db.select().from(materialNotes).where(condition);

    if (existing) {
      await db.update(materialNotes).set({ content }).where(condition);
    } else {
      await db.insert(materialNotes).values({
        id: Date.now().toString(),
        materialId: String(materialId),
        userId: String(info.userId),
        content: String(content),
      });
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save notes.', message: String(error) });
  }
}

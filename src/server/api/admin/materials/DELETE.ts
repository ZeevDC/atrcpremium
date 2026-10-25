import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { rawRows } from '../../../db/raw-rows.js';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware.js';
import { r2Delete } from '../../../lib/r2-storage.js';

export { requireAdmin };

export default async function handler(req: Request, res: Response) {
  try {
    const { id } = req.query as { id?: string };
    if (!id) return res.status(400).json({ error: 'id is required.' });

    // Use raw SQL to avoid ORM schema mismatch with live DB
    const rows = await db.execute(sql`SELECT \`id\`, \`filename\` FROM \`materials\` WHERE \`id\` = ${id} LIMIT 1`);
    const existing = rawRows<{ id: string; filename: string | null }>(rows)[0];
    if (!existing) return res.status(404).json({ error: 'Material not found.' });

    await db.execute(sql`DELETE FROM \`materials\` WHERE \`id\` = ${id}`);

    // Delete from R2 (non-fatal if already gone)
    if (existing.filename) {
      await r2Delete(existing.filename).catch((e: unknown) => {
        console.warn('[materials DELETE] R2 delete failed (non-fatal):', e);
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('[materials DELETE] error:', error);
    return res.status(500).json({ error: 'Failed to delete material.', message: String(error) });
  }
}

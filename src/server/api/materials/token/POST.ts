import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { rawRows } from '../../../db/raw-rows.js';
import { sql } from 'drizzle-orm';
import { resolveSession, requireActiveAccess, signMaterialToken } from '../../../lib/materials-auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;

    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const { materialId } = req.body as { materialId?: string };
    if (!materialId) return res.status(400).json({ error: 'materialId is required' });

    // Raw SQL — avoids Drizzle ORM referencing columns that may not exist in live DB
    const rows = await db.execute(sql`
      SELECT \`id\`, \`type\`, \`published\`
      FROM \`materials\`
      WHERE \`id\` = ${materialId}
      LIMIT 1
    `);
    const records = rawRows<Record<string, unknown>>(rows);
    if (!records.length) return res.status(404).json({ error: 'Material not found' });
    const mat = records[0];

    if (!mat.published && !info.isAdmin) return res.status(403).json({ error: 'Material not available' });
    if (String(mat.type ?? '') !== 'file') return res.status(400).json({ error: 'Token only needed for file materials' });

    const token = signMaterialToken(materialId, info.userId);
    res.json({ token, expiresInMs: 5 * 60 * 1000 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to issue token', message: String(error) });
  }
}

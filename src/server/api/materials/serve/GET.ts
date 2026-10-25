import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { rawRows } from '../../../db/raw-rows.js';
import { sql } from 'drizzle-orm';
import { verifyMaterialToken } from '../../../lib/materials-auth.js';
import { r2Stream } from '../../../lib/r2-storage.js';

export default async function handler(req: Request, res: Response) {
  try {
    const { token } = req.params as { token: string };
    if (!token) return res.status(400).json({ error: 'Token required' });

    const payload = verifyMaterialToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

    // Raw SQL — avoids Drizzle ORM referencing columns that may not exist in live DB
    const rows = await db.execute(sql`
      SELECT \`id\`, \`name\`, \`type\`, \`filename\`, \`url\`, \`mime_type\`
      FROM \`materials\`
      WHERE \`id\` = ${payload.materialId}
      LIMIT 1
    `);
    const records = rawRows<Record<string, unknown>>(rows);
    if (!records.length) return res.status(404).json({ error: 'Material not found' });
    const mat = records[0];
    if (String(mat.type ?? '') !== 'file') return res.status(404).json({ error: 'Material not found' });

    // Security headers — prevent download, caching, and embedding outside our app
    res.setHeader('Content-Type', String(mat.mime_type || 'application/octet-stream'));
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    res.setHeader('X-Download-Options', 'noopen');

    // mat.filename holds the R2 key (e.g. "1792824067956-filename.mp4")
    const r2Key = String(mat.filename || mat.url || '');
    if (!r2Key) return res.status(404).json({ error: 'File key missing' });
    await r2Stream(r2Key, res);
  } catch (error) {
    if (!res.headersSent) res.status(500).json({ error: 'Failed to serve file.', message: String(error) });
  }
}

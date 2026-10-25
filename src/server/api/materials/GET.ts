import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { rawRows } from '../../db/raw-rows.js';
import { sql } from 'drizzle-orm';
import { resolveSession, requireActiveAccess } from '../../lib/materials-auth.js';

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;

    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    // Keep the required query limited to original columns. Some deployments
    // still lack deleted_at until their migration runs; that must not make the
    // whole student materials page fail.
    const rows = await db.execute(sql`
      SELECT
        \`id\`, \`name\`, \`subject\`, \`category\`, \`type\`,
        \`filename\`, \`mime_type\`, \`size\`, \`url\`,
        \`watermark\`, \`published\`, \`uploaded_at\`
      FROM \`materials\`
      WHERE \`published\` = 1
      ORDER BY \`uploaded_at\` DESC
    `);

    const records = rawRows<Record<string, unknown>>(rows);

    // Fetch metadata columns separately — graceful fallback if not yet migrated
    const extraMap: Record<string, Record<string, unknown>> = {};
    try {
      const extras = await db.execute(sql`
        SELECT \`id\`, \`sort_order\`, \`password_hash\`
        FROM \`materials\`
        WHERE \`published\` = 1
      `);
      for (const e of rawRows<Record<string, unknown>>(extras)) {
        extraMap[String(e.id)] = e;
      }
    } catch { /* newer columns not yet migrated — skip */ }

    // deleted_at is optional across deployed database versions. A missing
    // column skips soft-delete filtering without breaking the materials list.
    const deletedIds = new Set<string>();
    try {
      const deletedRows = await db.execute(sql`
        SELECT \`id\` FROM \`materials\`
        WHERE \`published\` = 1 AND \`deleted_at\` IS NOT NULL
      `);
      for (const row of rawRows<Record<string, unknown>>(deletedRows)) {
        deletedIds.add(String(row.id));
      }
    } catch { /* deleted_at migration not yet applied — no soft deletes to filter */ }

    const result = records.map((r) => {
      const ex = extraMap[String(r.id)] ?? {};
      // If deleted_at exists, omit soft-deleted rows. If the column has not
      // been migrated yet, preserve the row and keep the page available.
      if (deletedIds.has(String(r.id))) return null;
      const type = String(r.type ?? 'file') as 'file' | 'link' | 'drive_folder';
      return {
        id: String(r.id),
        name: String(r.name ?? ''),
        subject: r.subject,
        category: r.category,
        type,
        mimeType: String(r.mime_type ?? 'application/octet-stream'),
        size: Number(r.size ?? 0),
        uploadedAt: r.uploaded_at ? new Date(r.uploaded_at as string).toISOString() : new Date().toISOString(),
        watermark: Boolean(r.watermark),
        sortOrder: Number(ex.sort_order ?? 0),
        hasPassword: !!(ex.password_hash),
        // For links and drive folders: return URL directly. For files: null (client requests serve token).
        url: (type === 'link' || type === 'drive_folder') ? String(r.url ?? '') : null,
      };
    }).filter((material): material is NonNullable<typeof material> => material !== null);

    res.json(result);
  } catch (error) {
    console.error('[student materials GET] error:', error);
    res.status(500).json({ error: 'Failed to load materials', message: String(error) });
  }
}

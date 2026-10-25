import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { rawRows } from '../../../db/raw-rows.js';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware.js';

export interface Material {
  id: string;
  name: string;
  subject: 'abnormal' | 'assessment' | 'io' | 'developmental' | 'general';
  category: 'notes' | 'drills' | 'lectures' | 'gizmo';
  type: 'file' | 'link' | 'drive_folder';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  watermark: boolean;
  published: boolean;
  url: string;
  thumbnailPath: string | null;
  sortOrder: number;
  scheduledAt: string | null;
  deletedAt: string | null;
  hasPassword: boolean;
}

export { requireAdmin };

export default async function handler(req: Request, res: Response) {
  try {
    // Use raw SQL with only the original 13 columns — safe against missing columns in live DB
    const rows = await db.execute(sql`
      SELECT
        \`id\`, \`name\`, \`subject\`, \`category\`, \`type\`,
        \`filename\`, \`original_name\`, \`mime_type\`, \`size\`, \`url\`,
        \`watermark\`, \`published\`, \`uploaded_by\`, \`uploaded_at\`
      FROM \`materials\`
      ORDER BY \`uploaded_at\` DESC
    `);

    const records = rawRows<Record<string, unknown>>(rows);

    // Fetch newer columns separately — each in its own try/catch so a missing column
    // doesn't break the whole list
    const extraMap: Record<string, Record<string, unknown>> = {};
    try {
      const extras = await db.execute(sql`
        SELECT \`id\`, \`thumbnail_path\`, \`sort_order\`, \`scheduled_at\`,
               \`deleted_at\`, \`password_hash\`
        FROM \`materials\`
      `);
      for (const e of rawRows<Record<string, unknown>>(extras)) {
        extraMap[String(e.id)] = e;
      }
    } catch { /* newer columns not yet migrated — skip */ }

    const result: Material[] = records.map((r) => {
      const ex = extraMap[String(r.id)] ?? {};
      return {
        id: String(r.id),
        name: String(r.name ?? ''),
        subject: (r.subject as Material['subject']) ?? 'general',
        category: (r.category as Material['category']) ?? 'notes',
        type: (r.type as 'file' | 'link' | 'drive_folder') ?? 'file',
        filename: String(r.filename ?? ''),
        originalName: String(r.original_name ?? ''),
        mimeType: String(r.mime_type ?? 'application/octet-stream'),
        size: Number(r.size ?? 0),
        uploadedAt: r.uploaded_at ? new Date(r.uploaded_at as string).toISOString() : new Date().toISOString(),
        uploadedBy: String(r.uploaded_by ?? 'admin'),
        watermark: Boolean(r.watermark),
        published: Boolean(r.published),
        url: String(r.url ?? ''),
        thumbnailPath: ex.thumbnail_path ? String(ex.thumbnail_path) : null,
        sortOrder: Number(ex.sort_order ?? 0),
        scheduledAt: ex.scheduled_at ? new Date(ex.scheduled_at as string).toISOString() : null,
        deletedAt: ex.deleted_at ? new Date(ex.deleted_at as string).toISOString() : null,
        hasPassword: !!(ex.password_hash),
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[admin materials GET] error:', error);
    res.status(500).json({ error: 'Failed to load materials', message: String(error) });
  }
}

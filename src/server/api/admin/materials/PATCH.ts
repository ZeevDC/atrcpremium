import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { rawRows } from '../../../db/raw-rows.js';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware.js';
import bcrypt from 'bcryptjs';

export { requireAdmin };

export default async function handler(req: Request, res: Response) {
  try {
    const {
      id, name, subject, category, watermark, published,
      url, sortOrder, scheduledAt, deletedAt, password, clearPassword,
    } = req.body as {
      id?: string; name?: string; subject?: string; category?: string;
      watermark?: boolean; published?: boolean; url?: string;
      sortOrder?: number; scheduledAt?: string | null; deletedAt?: string | null;
      password?: string; clearPassword?: boolean;
    };

    if (!id) return res.status(400).json({ error: 'id is required.' });

    // Check exists
    const rows = await db.execute(sql`SELECT * FROM \`materials\` WHERE \`id\` = ${id} LIMIT 1`);
    const existing = rawRows<Record<string, unknown>>(rows)[0];
    if (!existing) return res.status(404).json({ error: 'Material not found.' });

    // Update each field individually using raw SQL — safe against missing columns
    if (name !== undefined) {
      await db.execute(sql`UPDATE \`materials\` SET \`name\` = ${name.trim()} WHERE \`id\` = ${id}`);
    }
    if (subject !== undefined) {
      await db.execute(sql`UPDATE \`materials\` SET \`subject\` = ${subject} WHERE \`id\` = ${id}`);
    }
    if (category !== undefined) {
      await db.execute(sql`UPDATE \`materials\` SET \`category\` = ${category} WHERE \`id\` = ${id}`);
    }
    if (watermark !== undefined) {
      await db.execute(sql`UPDATE \`materials\` SET \`watermark\` = ${watermark ? 1 : 0} WHERE \`id\` = ${id}`);
    }
    if (published !== undefined) {
      await db.execute(sql`UPDATE \`materials\` SET \`published\` = ${published ? 1 : 0} WHERE \`id\` = ${id}`);
    }
    if (url !== undefined && (existing.type === 'link' || existing.type === 'drive_folder')) {
      await db.execute(sql`UPDATE \`materials\` SET \`url\` = ${(url as string).trim()} WHERE \`id\` = ${id}`);
    }

    // Newer columns — wrapped individually so a missing column doesn't fail the whole request
    if (sortOrder !== undefined) {
      try {
        await db.execute(sql`UPDATE \`materials\` SET \`sort_order\` = ${String(sortOrder)} WHERE \`id\` = ${id}`);
      } catch { /* column may not exist in live DB */ }
    }
    if (scheduledAt !== undefined) {
      try {
        await db.execute(sql`UPDATE \`materials\` SET \`scheduled_at\` = ${scheduledAt ?? null} WHERE \`id\` = ${id}`);
      } catch { /* column may not exist in live DB */ }
    }
    if (deletedAt !== undefined) {
      try {
        await db.execute(sql`UPDATE \`materials\` SET \`deleted_at\` = ${deletedAt ?? null} WHERE \`id\` = ${id}`);
      } catch { /* column may not exist in live DB */ }
    }
    if (clearPassword) {
      try {
        await db.execute(sql`UPDATE \`materials\` SET \`password_hash\` = NULL WHERE \`id\` = ${id}`);
      } catch { /* column may not exist in live DB */ }
    }
    if (password) {
      const pwHash = await bcrypt.hash(password, 10);
      try {
        await db.execute(sql`UPDATE \`materials\` SET \`password_hash\` = ${pwHash} WHERE \`id\` = ${id}`);
      } catch { /* column may not exist in live DB */ }
    }

    // Re-fetch updated row
    const updated = await db.execute(sql`SELECT * FROM \`materials\` WHERE \`id\` = ${id} LIMIT 1`);
    const row = rawRows<Record<string, unknown>>(updated)[0] ?? existing;

    return res.json({
      id: row.id,
      name: row.name,
      subject: row.subject,
      category: row.category,
      type: row.type,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      size: Number(row.size ?? 0),
      url: row.url,
      watermark: Boolean(row.watermark),
      published: Boolean(row.published),
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at ? new Date(row.uploaded_at as string).toISOString() : new Date().toISOString(),
      thumbnailPath: row.thumbnail_path ?? null,
      sortOrder: Number(row.sort_order ?? 0),
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string).toISOString() : null,
      deletedAt: row.deleted_at ? new Date(row.deleted_at as string).toISOString() : null,
      hasPassword: !!(row.password_hash),
    });
  } catch (error) {
    console.error('[materials PATCH] error:', error);
    return res.status(500).json({ error: 'Failed to update material.', message: String(error) });
  }
}

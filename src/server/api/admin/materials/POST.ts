import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'node:path';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '../middleware.js';
import type { Material } from './GET.js';
import bcrypt from 'bcryptjs';
import { r2Upload } from '../../../lib/r2-storage.js';

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/x-m4v',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXT = [
  '.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.webm', '.mov', '.mkv', '.m4v',
  '.ppt', '.pptx', '.doc', '.docx',
];

// Use memory storage — buffer is uploaded to R2, never written to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB — larger files use chunked upload
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME.includes(file.mimetype) || ALLOWED_EXT.includes(ext)) cb(null, true);
    else cb(new Error(`File type not allowed: ${file.mimetype || ext || 'unknown'}`));
  },
});

export const multerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large for direct upload. Use chunked upload for files over 50 MB.' });
    }
    if (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      return res.status(400).json({ error: message });
    }
    next();
  });
};

export { requireAdmin };

type Fields = {
  type?: string; name?: string; subject?: string; category?: string;
  watermark?: string; published?: string; url?: string; password?: string;
};

export default async function handler(req: Request, res: Response) {
  const fields = (req.body ?? {}) as Fields;
  const type = fields.type;

  try {
    // ── Drive folder or Link (no file upload) ────────────────────────────────
    if (type === 'drive_folder' || type === 'link') {
      if (!fields.url?.trim()) return res.status(400).json({ error: 'URL is required for link type.' });

      const resolvedType = (type === 'drive_folder' ? 'drive_folder' : 'link') as 'link' | 'drive_folder';
      const linkId = Date.now().toString();
      const linkPwHash = fields.password ? await bcrypt.hash(fields.password, 10) : null;

      const linkMime = resolvedType === 'drive_folder' ? 'application/vnd.google-apps.folder' : 'text/uri-list';
      const linkName = (fields.name?.trim() || fields.url.trim()).slice(0, 499);
      const linkSubject = ((fields.subject || 'general') as Material['subject']);
      const linkCategory = ((fields.category || 'notes') as Material['category']);
      const linkWatermark = fields.watermark === 'true' ? 1 : 0;
      const linkPublished = fields.published !== 'false' ? 1 : 0;

      await db.execute(sql`
        INSERT INTO \`materials\`
          (\`id\`, \`name\`, \`subject\`, \`category\`, \`type\`,
           \`filename\`, \`original_name\`, \`mime_type\`, \`size\`, \`url\`,
           \`watermark\`, \`published\`, \`uploaded_by\`)
        VALUES
          (${linkId}, ${linkName}, ${linkSubject}, ${linkCategory}, ${resolvedType},
           '', '', ${linkMime}, '0', ${fields.url.trim()},
           ${linkWatermark}, ${linkPublished}, 'admin')
      `);
      if (linkPwHash) {
        try {
          await db.execute(sql`UPDATE \`materials\` SET \`password_hash\` = ${linkPwHash} WHERE \`id\` = ${linkId}`);
        } catch { /* column may not exist yet */ }
      }

      const linkInserted: Material = {
        id: linkId,
        name: linkName,
        subject: linkSubject,
        category: linkCategory,
        type: resolvedType,
        filename: '',
        originalName: '',
        mimeType: linkMime,
        size: 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        watermark: fields.watermark === 'true',
        published: fields.published !== 'false',
        url: fields.url.trim(),
        thumbnailPath: null,
        sortOrder: 0,
        scheduledAt: null,
        deletedAt: null,
        hasPassword: !!linkPwHash,
      };
      return res.status(201).json(linkInserted);
    }

    // ── File upload ──────────────────────────────────────────────────────────
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const file = req.file;
    const fileId = Date.now().toString();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const r2Key = `${fileId}-${base}${ext}`;

    // Upload buffer to R2
    console.log('[materials POST] Starting R2 upload, key:', r2Key, 'size:', file.size);
    await r2Upload(r2Key, file.buffer, file.mimetype || 'application/octet-stream');
    console.log('[materials POST] R2 upload complete, inserting DB row');

    const filePwHash = fields.password ? await bcrypt.hash(fields.password, 10) : null;

    const isWatermark = fields.watermark === 'true' ? 1 : 0;
    const isPublished = fields.published !== 'false' ? 1 : 0;
    const resolvedName = (fields.name?.trim() || file.originalname).slice(0, 499);
    const resolvedSubject = ((fields.subject || 'general') as Material['subject']);
    const resolvedCategory = ((fields.category || 'notes') as Material['category']);

    await db.execute(sql`
      INSERT INTO \`materials\`
        (\`id\`, \`name\`, \`subject\`, \`category\`, \`type\`,
         \`filename\`, \`original_name\`, \`mime_type\`, \`size\`, \`url\`,
         \`watermark\`, \`published\`, \`uploaded_by\`)
      VALUES
        (${fileId}, ${resolvedName}, ${resolvedSubject}, ${resolvedCategory}, 'file',
         ${r2Key}, ${file.originalname.slice(0, 499)}, ${file.mimetype}, ${String(file.size)}, ${r2Key},
         ${isWatermark}, ${isPublished}, 'admin')
    `);
    console.log('[materials POST] DB insert complete, id:', fileId, 'published:', isPublished);
    if (filePwHash) {
      try {
        await db.execute(sql`UPDATE \`materials\` SET \`password_hash\` = ${filePwHash} WHERE \`id\` = ${fileId}`);
      } catch { /* column may not exist yet */ }
    }

    const fileInserted: Material = {
      id: fileId,
      name: resolvedName,
      subject: resolvedSubject,
      category: resolvedCategory,
      type: 'file',
      filename: r2Key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin',
      watermark: fields.watermark === 'true',
      published: fields.published !== 'false',
      url: r2Key,
      thumbnailPath: null,
      sortOrder: 0,
      scheduledAt: null,
      deletedAt: null,
      hasPassword: !!filePwHash,
    };
    return res.status(201).json(fileInserted);

  } catch (error) {
    console.error('[materials POST] Error:', error);
    return res.status(500).json({ error: 'Failed to add material.', message: String(error) });
  }
}

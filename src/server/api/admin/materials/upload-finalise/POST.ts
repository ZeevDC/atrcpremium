import type { Request, Response } from 'express';
import fs from 'node:fs';
import os from 'node:os';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { db } from '../../../../db/client.js';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '../../middleware.js';
import bcrypt from 'bcryptjs';
import {
  r2Upload,
  r2MultipartCreate,
  r2MultipartUploadPart,
  r2MultipartComplete,
  r2MultipartAbort,
  type R2UploadedPart,
} from '../../../../lib/r2-storage.js';
import type { Material } from '../GET.js';

export { requireAdmin };

// R2 multipart: each part must be ≥5 MB (except the last).
// Cloudflare Workers has a hard 100 MB request body limit — keep parts at 50 MB
// to stay safely under that ceiling even with encoding overhead.
const MULTIPART_THRESHOLD = 50 * 1024 * 1024; // 50 MB — use multipart above this
const PART_SIZE = 50 * 1024 * 1024;            // 50 MB per part

function chunksDir(uploadId: string): string {
  return path.join(os.tmpdir(), 'atrc-chunks', uploadId);
}

export default async function handler(req: Request, res: Response) {
  try {
    const { uploadId, originalName, name, subject, category, mimeType, watermark, published, password, totalChunks } =
      req.body as {
        uploadId: string; originalName: string; name?: string; subject?: string;
        category?: string; mimeType?: string; watermark?: string; published?: string;
        password?: string; totalChunks?: string;
      };

    if (!uploadId || !/^[a-zA-Z0-9_-]+$/.test(uploadId)) {
      return res.status(400).json({ error: 'Invalid uploadId.' });
    }

    const dir = chunksDir(uploadId);
    if (!fs.existsSync(dir)) return res.status(400).json({ error: 'No chunks found for this uploadId.' });

    const total = parseInt(totalChunks ?? '1', 10);
    const ext = path.extname(originalName || '');
    const base = path.basename(originalName || 'upload', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileId = Date.now().toString();
    const r2Key = `${fileId}-${base}${ext}`;

    // Assemble chunks into a single temp file
    const tmpPath = path.join(os.tmpdir(), `atrc-assemble-${fileId}${ext}`);
    const writeStream = fs.createWriteStream(tmpPath);

    for (let i = 0; i < total; i++) {
      const chunkPath = path.join(dir, `chunk-${String(i).padStart(6, '0')}`);
      if (!fs.existsSync(chunkPath)) {
        writeStream.destroy();
        try { fs.unlinkSync(tmpPath); } catch { /* non-fatal */ }
        return res.status(400).json({ error: `Missing chunk ${i}` });
      }
      const readStream = fs.createReadStream(chunkPath);
      await pipeline(readStream, writeStream, { end: false });
    }

    await new Promise<void>((resolve, reject) => {
      writeStream.end();
      writeStream.once('finish', resolve);
      writeStream.once('error', reject);
    });

    // Clean up chunks dir
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* non-fatal */ }

    const fileSize = fs.statSync(tmpPath).size;
    const resolvedMime = (mimeType || 'application/octet-stream').slice(0, 254);

    console.log('[finalise] Starting R2 upload, key:', r2Key, 'size:', fileSize, 'multipart:', fileSize > MULTIPART_THRESHOLD);
    try {
      if (fileSize <= MULTIPART_THRESHOLD) {
        // Small enough — single PUT
        const fileBuffer = fs.readFileSync(tmpPath);
        await r2Upload(r2Key, fileBuffer, resolvedMime);
        console.log('[finalise] R2 single upload complete');
      } else {
        // Large file — use R2 multipart upload, streaming 90 MB parts
        const { uploadId: r2UploadId } = await r2MultipartCreate(r2Key, resolvedMime);
        const uploadedParts: R2UploadedPart[] = [];
        let partNumber = 1;
        let offset = 0;

        try {
          const fd = fs.openSync(tmpPath, 'r');
          try {
            while (offset < fileSize) {
              const chunkSize = Math.min(PART_SIZE, fileSize - offset);
              const buf = Buffer.allocUnsafe(chunkSize);
              fs.readSync(fd, buf, 0, chunkSize, offset);
              const part = await r2MultipartUploadPart(r2Key, r2UploadId, partNumber, buf);
              uploadedParts.push(part);
              offset += chunkSize;
              partNumber++;
            }
          } finally {
            fs.closeSync(fd);
          }
          await r2MultipartComplete(r2Key, r2UploadId, uploadedParts);
          console.log('[finalise] R2 multipart complete, parts:', uploadedParts.length);
        } catch (err) {
          await r2MultipartAbort(r2Key, r2UploadId);
          throw err;
        }
      }
    } finally {
      try { fs.unlinkSync(tmpPath); } catch { /* non-fatal */ }
    }

    const pwHash = password ? await bcrypt.hash(password, 10) : null;
    const resolvedName = (name?.trim() || originalName).slice(0, 499);
    const resolvedSubject = ((subject || 'general') as Material['subject']);
    const resolvedCategory = ((category || 'notes') as Material['category']);
    const isWatermark = watermark === 'true' ? 1 : 0;
    const isPublished = published !== 'false' ? 1 : 0;

    try {
      await db.execute(sql`
        INSERT INTO \`materials\`
          (\`id\`, \`name\`, \`subject\`, \`category\`, \`type\`,
           \`filename\`, \`original_name\`, \`mime_type\`, \`size\`, \`url\`,
           \`watermark\`, \`published\`, \`uploaded_by\`)
        VALUES
          (${fileId}, ${resolvedName}, ${resolvedSubject}, ${resolvedCategory}, 'file',
           ${r2Key}, ${originalName.slice(0, 499)}, ${resolvedMime}, ${String(fileSize)}, ${r2Key},
           ${isWatermark}, ${isPublished}, 'admin')
      `);

      if (pwHash) {
        try {
          await db.execute(sql`UPDATE \`materials\` SET \`password_hash\` = ${pwHash} WHERE \`id\` = ${fileId}`);
        } catch { /* column may not exist yet */ }
      }
    console.log('[finalise] DB insert starting, id:', fileId, 'published:', isPublished);
    } catch (dbErr) {
      console.error('[finalise] DB insert failed:', dbErr);
      return res.status(500).json({ error: 'DB insert failed.', message: String(dbErr) });
    }

    const inserted: Material = {
      id: fileId,
      name: resolvedName,
      subject: resolvedSubject,
      category: resolvedCategory,
      type: 'file',
      filename: r2Key,
      originalName,
      mimeType: resolvedMime,
      size: fileSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin',
      watermark: watermark === 'true',
      published: published !== 'false',
      url: r2Key,
      thumbnailPath: null,
      sortOrder: 0,
      scheduledAt: null,
      deletedAt: null,
      hasPassword: !!pwHash,
    };

    return res.status(201).json(inserted);
  } catch (error) {
    console.error('[finalise] Unexpected error:', error);
    return res.status(500).json({ error: 'Failed to finalise upload.', message: String(error) });
  }
}

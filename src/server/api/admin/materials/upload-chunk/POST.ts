import type { Request, Response } from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import multer from 'multer';
import { requireAdmin } from '../../middleware.js';

export { requireAdmin };

// Chunks land in OS temp dir — no dependency on /private
function chunksDir(uploadId: string): string {
  return path.join(os.tmpdir(), 'atrc-chunks', uploadId);
}

const chunkStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const { uploadId } = req.params as { uploadId: string };
    const dir = chunksDir(uploadId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, _file, cb) => {
    const { index } = req.query as { index?: string };
    cb(null, `chunk-${String(index ?? '0').padStart(6, '0')}`);
  },
});

const upload = multer({
  storage: chunkStorage,
  limits: { fileSize: 60 * 1024 * 1024 }, // 60 MB per chunk
});

export const multerMiddleware = (req: Request, res: Response, next: import('express').NextFunction) => {
  upload.single('chunk')(req, res, (err: unknown) => {
    if (err) {
      const msg = err instanceof Error ? err.message : 'Chunk upload failed.';
      return res.status(400).json({ error: msg });
    }
    next();
  });
};

export default async function handler(req: Request, res: Response) {
  const { uploadId } = req.params as { uploadId: string };
  const { index, total } = req.query as { index?: string; total?: string };

  if (!req.file) return res.status(400).json({ error: 'No chunk received.' });
  if (!uploadId || !/^[a-zA-Z0-9_-]+$/.test(uploadId)) {
    return res.status(400).json({ error: 'Invalid uploadId.' });
  }

  const chunkIndex = parseInt(index ?? '0', 10);
  const totalChunks = parseInt(total ?? '1', 10);

  return res.json({ ok: true, uploadId, chunkIndex, totalChunks });
}

import type { Request, Response } from 'express';
import fs from 'node:fs';

export default async function handler(_req: Request, res: Response) {
  try {
    const filePath = '/private/last-backup.json';
    if (!fs.existsSync(filePath)) {
      return res.json({ lastBackup: null });
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as { timestamp: string; tablesExported: string[] };
    return res.json({ lastBackup: data });
  } catch {
    return res.json({ lastBackup: null });
  }
}

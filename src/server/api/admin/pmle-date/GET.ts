import type { Request, Response } from 'express';
import fs from 'node:fs';

const DATA_FILE = '/private/pmle-date.json';

export function loadPmleDate(): string | null {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as { date?: string };
    return raw.date ?? null;
  } catch {
    return null;
  }
}

export default function handler(_req: Request, res: Response) {
  const date = loadPmleDate();
  res.json({ date });
}

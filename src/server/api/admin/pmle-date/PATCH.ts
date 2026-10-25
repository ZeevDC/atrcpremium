import type { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';

const DATA_FILE = '/private/pmle-date.json';

export default function handler(req: Request, res: Response) {
  const { date } = req.body as { date?: string };

  if (date !== null && date !== undefined && date !== '') {
    // Validate ISO date string (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
    }
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({ error: 'Invalid date value.' });
    }
  }

  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ date: date || null }), 'utf-8');
    res.json({ date: date || null });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}

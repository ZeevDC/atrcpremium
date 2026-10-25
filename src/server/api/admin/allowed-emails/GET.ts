import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { allowedEmails } from '../../../db/schema.js';

export default async function handler(_req: Request, res: Response) {
  try {
    const rows = await db.select().from(allowedEmails).orderBy(allowedEmails.addedAt);
    return res.json(rows);
  } catch (err) {
    console.error('allowed-emails.get.failed', err);
    return res.status(500).json({ error: 'Failed to fetch allowed emails' });
  }
}
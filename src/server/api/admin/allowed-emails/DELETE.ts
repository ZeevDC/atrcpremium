import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { allowedEmails } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }
  const normalized = email.toLowerCase().trim();
  try {
    await db.delete(allowedEmails).where(eq(allowedEmails.email, normalized));
    return res.json({ ok: true });
  } catch (err) {
    console.error('allowed-emails.delete.failed', err);
    return res.status(500).json({ error: 'Failed to remove email' });
  }
}
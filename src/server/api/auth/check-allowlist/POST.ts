import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { allowedEmails } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ allowed: false, error: 'Email is required.' });
  }
  try {
    const rows = await db
      .select()
      .from(allowedEmails)
      .where(eq(allowedEmails.email, email.trim().toLowerCase()))
      .limit(1);
    return res.json({ allowed: rows.length > 0 });
  } catch (err) {
    console.error('check-allowlist.failed', err);
    return res.status(500).json({ allowed: false, error: 'Server error.' });
  }
}

import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { verification, user, account } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';

export default async function handler(req: Request, res: Response) {
  const { email, otp, newPassword } = req.body as { email?: string; otp?: string; newPassword?: string };
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'email, otp, and newPassword are required' });
  }
  const normalized = email.toLowerCase().trim();

  const rows = await db.select().from(verification).where(eq(verification.identifier, 'otp:' + normalized)).limit(1);
  if (rows.length === 0) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });

  const record = rows[0];
  if (new Date() > record.expiresAt) {
    await db.delete(verification).where(eq(verification.identifier, 'otp:' + normalized));
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (record.value !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });

  await db.delete(verification).where(eq(verification.identifier, 'otp:' + normalized));

  const userRows = await db.select().from(user).where(eq(user.email, normalized)).limit(1);
  if (userRows.length === 0) return res.status(400).json({ error: 'No account found for this email.' });

  // Use BetterAuth's own hashPassword so the stored hash is verifiable on login
  const hashed = await hashPassword(newPassword);
  await db.update(account)
    .set({ password: hashed })
    .where(eq(account.userId, userRows[0].id));

  return res.json({ ok: true, message: 'Password updated successfully.' });
}

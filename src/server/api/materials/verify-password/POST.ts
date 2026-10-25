// Step 5: Password-protected materials
// Verifies the student-supplied password for a material and returns a short-lived
// access token stored in sessionStorage on the client.
import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { materials } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { resolveSession, requireActiveAccess } from '../../../lib/materials-auth.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

// Simple in-memory rate limiter: max 5 attempts per (userId + materialId) per minute
const attempts = new Map<string, { count: number; resetAt: number }>();

export default async function handler(req: Request, res: Response) {
  try {
    const info = await resolveSession(req, res);
    if (!info) return;

    const ok = await requireActiveAccess(res, info);
    if (!ok) return;

    const { materialId, password } = req.body as { materialId?: string; password?: string };
    if (!materialId || !password) return res.status(400).json({ error: 'materialId and password are required.' });

    // Rate limit
    const key = `${info.userId}:${materialId}`;
    const now = Date.now();
    const entry = attempts.get(key);
    if (entry && now < entry.resetAt) {
      if (entry.count >= 5) return res.status(429).json({ error: 'Too many attempts. Please wait a minute.' });
      entry.count++;
    } else {
      attempts.set(key, { count: 1, resetAt: now + 60_000 });
    }

    const [mat] = await db.select().from(materials).where(eq(materials.id, materialId));
    if (!mat || !mat.published) return res.status(404).json({ error: 'Material not found.' });
    if (!mat.passwordHash) return res.status(400).json({ error: 'This material is not password-protected.' });

    const match = await bcrypt.compare(password, mat.passwordHash);
    if (!match) return res.status(401).json({ error: 'Incorrect password.' });

    // Issue a 30-minute access token for this material
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 60 * 1000;

    // Reset rate limit on success
    attempts.delete(key);

    res.json({ token, materialId, expiresAt });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify password.', message: String(error) });
  }
}

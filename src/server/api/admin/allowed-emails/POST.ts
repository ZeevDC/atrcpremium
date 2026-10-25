import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { allowedEmails, studentAccess } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { addMonths, planDurationMonths, logAudit, ADMIN_EMAIL } from '../../../lib/access-helpers.js';
import type { PlanType } from '../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  const { email, note, planType, startDate } = req.body as {
    email?: string;
    note?: string;
    planType?: PlanType;
    startDate?: string;
  };

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'email is required' });
  }
  if (!planType || !['monthly', 'quarterly', 'yearly', 'custom'].includes(planType)) {
    return res.status(400).json({ error: 'planType is required (monthly|quarterly|yearly|custom)' });
  }
  if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    return res.status(400).json({ error: 'startDate is required (YYYY-MM-DD)' });
  }

  const normalized = email.toLowerCase().trim();
  const expiryDate = planType !== 'custom'
    ? addMonths(startDate, planDurationMonths(planType))
    : null;

  try {
    const allowlistId = crypto.randomUUID();
    await db.insert(allowedEmails).values({
      id: allowlistId,
      email: normalized,
      note: note ?? null,
    });

    // Check if user already exists and create/update access record
    const { user } = await import('../../../db/schema.js');
    const users = await db.select().from(user).where(eq(user.email, normalized));
    if (users.length) {
      const userId = users[0].id;
      const existing = await db.select().from(studentAccess).where(eq(studentAccess.userId, userId));
      if (!existing.length) {
        await db.insert(studentAccess).values({
          id: crypto.randomUUID(),
          userId,
          planType,
          startDate,
          expiryDate,
          status: 'active',
        });
        await logAudit({
          userId,
          changedBy: ADMIN_EMAIL,
          action: 'grant',
          newPlan: planType,
          newExpiry: expiryDate,
          newStatus: 'active',
          notes: note ?? null,
        });
      }
    }

    return res.status(201).json({ ok: true, email: normalized, planType, startDate, expiryDate });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Duplicate') || msg.includes('unique')) {
      return res.status(409).json({ error: 'Email already on the allowlist' });
    }
    console.error('allowed-emails.post.failed', err);
    return res.status(500).json({ error: 'Failed to add email' });
  }
}

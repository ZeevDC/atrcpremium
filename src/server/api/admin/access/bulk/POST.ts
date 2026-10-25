import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { studentAccess } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import {
  getAccessRecord, computeStatus, logAudit, addMonths,
  todayPHT, ADMIN_EMAIL,
} from '../../../../lib/access-helpers.js';
import type { PlanType } from '../../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  const { userIds, action, expiryDate, months } = req.body as {
    userIds: string[];
    action: 'extend' | 'set_expiry' | 'suspend' | 'reactivate';
    expiryDate?: string;
    months?: number;
  };

  if (!Array.isArray(userIds) || !userIds.length) {
    return res.status(400).json({ error: 'userIds required' });
  }

  const now = todayPHT();
  const results: { userId: string; ok: boolean }[] = [];

  for (const userId of userIds) {
    try {
      const existing = await getAccessRecord(userId);
      let newExpiry = existing?.expiryDate ?? null;
      let newStatus = existing?.status ?? 'pending';

      if (action === 'extend' && months) {
        const base = newExpiry && newExpiry >= now ? newExpiry : now;
        newExpiry = addMonths(base, months);
        newStatus = 'active';
      } else if (action === 'set_expiry' && expiryDate) {
        newExpiry = expiryDate;
        newStatus = 'active';
      } else if (action === 'suspend') {
        newStatus = 'suspended';
      } else if (action === 'reactivate') {
        newStatus = 'active';
      }

      const computed = computeStatus(newStatus, newExpiry);
      if (newStatus !== 'suspended') newStatus = computed;

      if (existing) {
        await db.update(studentAccess).set({ expiryDate: newExpiry, status: newStatus }).where(eq(studentAccess.userId, userId));
      } else {
        await db.insert(studentAccess).values({
          id: crypto.randomUUID(),
          userId,
          planType: 'custom' as PlanType,
          startDate: now,
          expiryDate: newExpiry,
          status: newStatus,
        });
      }

      await logAudit({
        userId,
        changedBy: ADMIN_EMAIL,
        action: 'bulk_' + action,
        oldExpiry: existing?.expiryDate ?? null,
        newExpiry,
        oldStatus: existing?.status ?? null,
        newStatus,
      });

      results.push({ userId, ok: true });
    } catch {
      results.push({ userId, ok: false });
    }
  }

  return res.json({ results });
}

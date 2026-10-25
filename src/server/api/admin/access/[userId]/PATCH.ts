import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { studentAccess } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import {
  getAccessRecord, computeStatus, daysRemaining, logAudit,
  addMonths, planDurationMonths, todayPHT, ADMIN_EMAIL,
} from '../../../../lib/access-helpers.js';
import type { PlanType } from '../../../../db/schema.js';

export default async function handler(req: Request, res: Response) {
  const { userId } = req.params as { userId: string };
  const adminEmail = ADMIN_EMAIL;

  const {
    planType,
    startDate,
    expiryDate,
    action,
    adminNotes,
  } = req.body as {
    planType?: PlanType;
    startDate?: string;
    expiryDate?: string;
    action?: string;
    adminNotes?: string;
  };

  try {
    const existing = await getAccessRecord(userId);
    const now = todayPHT();

    let newPlan = planType ?? existing?.planType ?? 'custom';
    let newStart = startDate ?? existing?.startDate ?? now;
    let newExpiry = expiryDate ?? existing?.expiryDate ?? null;
    let newStatus = existing?.status ?? 'pending';

    if (action === 'suspend') {
      newStatus = 'suspended';
    } else if (action === 'reactivate') {
      newStatus = 'active';
    } else if (action === 'revoke') {
      newExpiry = now;
      newStatus = 'expired';
    } else if (action === 'extend_1m' || action === 'extend_3m' || action === 'extend_1y') {
      const months = action === 'extend_1m' ? 1 : action === 'extend_3m' ? 3 : 12;
      const base = newExpiry && newExpiry >= now ? newExpiry : now;
      newExpiry = addMonths(base, months);
      newStatus = 'active';
    } else if (planType && planType !== 'custom' && !expiryDate) {
      const base = newStart ?? now;
      newExpiry = addMonths(base, planDurationMonths(planType as PlanType));
    }

    if (action !== 'suspend' && action !== 'reactivate' && action !== 'revoke') {
      const computed = computeStatus(newStatus, newExpiry);
      if (computed !== 'suspended') newStatus = computed;
    }

    const auditAction = action ?? (existing ? 'plan_change' : 'grant');

    if (existing) {
      await db.update(studentAccess).set({
        planType: newPlan as PlanType,
        startDate: newStart,
        expiryDate: newExpiry,
        status: newStatus,
        adminNotes: adminNotes ?? existing.adminNotes,
      }).where(eq(studentAccess.userId, userId));
    } else {
      await db.insert(studentAccess).values({
        id: crypto.randomUUID(),
        userId,
        planType: newPlan as PlanType,
        startDate: newStart,
        expiryDate: newExpiry,
        status: newStatus,
        adminNotes: adminNotes ?? null,
      });
    }

    await logAudit({
      userId,
      changedBy: adminEmail,
      action: auditAction,
      oldPlan: existing?.planType ?? null,
      newPlan,
      oldExpiry: existing?.expiryDate ?? null,
      newExpiry,
      oldStatus: existing?.status ?? null,
      newStatus,
      notes: adminNotes ?? null,
    });

    const updated = await getAccessRecord(userId);
    const days = daysRemaining(updated?.expiryDate);
    return res.json({ ok: true, access: { ...updated, liveStatus: computeStatus(updated?.status ?? 'pending', updated?.expiryDate), daysRemaining: days } });
  } catch (err) {
    console.error('admin.access.patch.failed', err);
    return res.status(500).json({ error: 'Failed to update access' });
  }
}

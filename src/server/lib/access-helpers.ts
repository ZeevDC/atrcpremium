import { db } from '../db/client.js';
import { studentAccess, accessAuditLog, type PlanType, type AccessStatus } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

// PHT = UTC+8
export function nowPHT(): Date {
  const now = new Date();
  return new Date(now.getTime() + 8 * 60 * 60 * 1000);
}

export function todayPHT(): string {
  return nowPHT().toISOString().slice(0, 10);
}

/** Add months to a YYYY-MM-DD string, returns YYYY-MM-DD */
export function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function planDurationMonths(plan: PlanType): number {
  if (plan === 'monthly') return 1;
  if (plan === 'quarterly') return 3;
  if (plan === 'yearly') return 12;
  return 0;
}

/** Compute live status from stored dates (PHT) */
export function computeStatus(
  storedStatus: string,
  expiryDate: string | null | undefined,
): AccessStatus {
  if (storedStatus === 'suspended') return 'suspended';
  if (!expiryDate) return 'pending';
  const today = todayPHT();
  if (expiryDate < today) return 'expired';
  // 7 days or fewer
  const expiry = new Date(expiryDate + 'T00:00:00Z');
  const todayD = new Date(today + 'T00:00:00Z');
  const diffMs = expiry.getTime() - todayD.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'expiring_soon';
  return 'active';
}

export function daysRemaining(expiryDate: string | null | undefined): number | null {
  if (!expiryDate) return null;
  const today = todayPHT();
  const expiry = new Date(expiryDate + 'T00:00:00Z');
  const todayD = new Date(today + 'T00:00:00Z');
  return Math.ceil((expiry.getTime() - todayD.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getAccessRecord(userId: string) {
  const rows = await db.select().from(studentAccess).where(eq(studentAccess.userId, userId));
  return rows[0] ?? null;
}

export async function logAudit(params: {
  userId: string;
  changedBy: string;
  action: string;
  oldPlan?: string | null;
  newPlan?: string | null;
  oldExpiry?: string | null;
  newExpiry?: string | null;
  oldStatus?: string | null;
  newStatus?: string | null;
  notes?: string | null;
}) {
  await db.insert(accessAuditLog).values({
    id: crypto.randomUUID(),
    userId: params.userId,
    changedBy: params.changedBy,
    action: params.action,
    oldPlan: params.oldPlan ?? null,
    newPlan: params.newPlan ?? null,
    oldExpiry: params.oldExpiry ?? null,
    newExpiry: params.newExpiry ?? null,
    oldStatus: params.oldStatus ?? null,
    newStatus: params.newStatus ?? null,
    notes: params.notes ?? null,
  });
}

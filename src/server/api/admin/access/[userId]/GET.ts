import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { accessAuditLog } from '../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { getAccessRecord, computeStatus, daysRemaining } from '../../../../lib/access-helpers.js';

export default async function handler(req: Request, res: Response) {
  const { userId } = req.params as { userId: string };
  try {
    const access = await getAccessRecord(userId);
    const logs = await db.select().from(accessAuditLog)
      .where(eq(accessAuditLog.userId, userId))
      .orderBy(desc(accessAuditLog.createdAt))
      .limit(50);

    if (!access) {
      return res.json({ access: null, auditLog: logs });
    }

    const liveStatus = computeStatus(access.status, access.expiryDate);
    const days = daysRemaining(access.expiryDate);

    return res.json({
      access: { ...access, liveStatus, daysRemaining: days },
      auditLog: logs,
    });
  } catch (err) {
    console.error('admin.access.get.failed', err);
    return res.status(500).json({ error: 'Failed to get access record' });
  }
}

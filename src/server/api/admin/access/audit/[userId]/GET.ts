import type { Request, Response } from 'express';
import { db } from '../../../../../db/client.js';
import { accessAuditLog } from '../../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  const { userId } = req.params as { userId: string };
  try {
    const logs = await db.select().from(accessAuditLog)
      .where(eq(accessAuditLog.userId, userId))
      .orderBy(desc(accessAuditLog.createdAt))
      .limit(100);
    return res.json(logs);
  } catch (err) {
    console.error('admin.access.audit.failed', err);
    return res.status(500).json({ error: 'Failed to get audit log' });
  }
}

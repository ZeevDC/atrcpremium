import type { Request, Response } from 'express';
import { db } from '../../../../db/client.js';
import { studentAccess, user } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { daysRemaining } from '../../../../lib/access-helpers.js';

export default async function handler(_req: Request, res: Response) {
  try {
    const rows = await db.select().from(studentAccess);
    const expiring = rows.filter(r => {
      if (!r.expiryDate) return false;
      if (r.status === 'suspended') return false;
      const days = daysRemaining(r.expiryDate);
      return days !== null && days >= 0 && days <= 7;
    });

    const enriched = await Promise.all(expiring.map(async (r) => {
      const users = await db.select().from(user).where(eq(user.id, r.userId));
      const u = users[0];
      return {
        ...r,
        userName: u?.name ?? 'Unknown',
        userEmail: u?.email ?? '',
        daysRemaining: daysRemaining(r.expiryDate),
      };
    }));

    enriched.sort((a, b) => (a.daysRemaining ?? 99) - (b.daysRemaining ?? 99));
    return res.json(enriched);
  } catch (err) {
    console.error('admin.access.expiring.failed', err);
    return res.status(500).json({ error: 'Failed to get expiring list' });
  }
}

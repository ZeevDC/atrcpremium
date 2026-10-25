import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { account, user } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
// Use BetterAuth's built-in password hasher (no external bcrypt needed)
import { hashPassword } from 'better-auth/crypto';

export default async function handler(req: Request, res: Response) {
  const secret = req.headers['x-seed-secret'];
  if (secret !== 'atrc-seed-2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const users = await db.select().from(user).where(eq(user.email, 'anotoreviewcenter@gmail.com'));
    if (!users.length) return res.status(404).json({ error: 'User not found' });

    const userId = users[0].id;
    const hashed = await hashPassword('ATRCadmin2026!');

    const accounts = await db.select().from(account).where(eq(account.userId, userId));
    const credAccount = accounts.find(a => a.providerId === 'credential');

    if (credAccount) {
      await db.update(account)
        .set({ password: hashed })
        .where(eq(account.id, credAccount.id));
    } else {
      await db.insert(account).values({
        id: crypto.randomUUID(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: hashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return res.json({ ok: true, message: 'Password reset for ' + users[0].email, accountsFound: accounts.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
}

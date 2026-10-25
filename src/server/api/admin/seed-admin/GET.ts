import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { account, user } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword } from 'better-auth/crypto';

export default async function handler(req: Request, res: Response) {
  const secret = req.headers['x-seed-secret'];
  if (secret !== 'atrc-seed-2026') return res.status(403).json({ error: 'Forbidden' });

  try {
    const users = await db.select().from(user).where(eq(user.email, 'anotoreviewcenter@gmail.com'));
    if (!users.length) return res.json({ userExists: false });

    const userId = users[0].id;
    const accounts = await db.select().from(account).where(eq(account.userId, userId));
    const credAccount = accounts.find(a => a.providerId === 'credential');

    if (!credAccount) return res.json({ userExists: true, credAccountExists: false, accounts: accounts.map(a => a.providerId) });

    const storedHash = credAccount.password ?? '';
    const testVerify = await verifyPassword({ hash: storedHash, password: 'ATRCadmin2026!' });

    // Also re-hash and update to be sure
    const freshHash = await hashPassword('ATRCadmin2026!');
    await db.update(account).set({ password: freshHash }).where(eq(account.id, credAccount.id));
    const reVerify = await verifyPassword({ hash: freshHash, password: 'ATRCadmin2026!' });

    return res.json({
      userExists: true,
      credAccountExists: true,
      providerId: credAccount.providerId,
      hashPrefix: storedHash.slice(0, 20),
      verifyOldHash: testVerify,
      freshHashPrefix: freshHash.slice(0, 20),
      verifyFreshHash: reVerify,
      updated: true,
    });
  } catch (err: unknown) {
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}

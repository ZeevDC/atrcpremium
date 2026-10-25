import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { user } from '../../../db/schema.js';
import { ne } from 'drizzle-orm';

const ADMIN_EMAIL = 'anotoreviewcenter@gmail.com';

export default async function handler(_req: Request, res: Response) {
  try {
    const users = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }).from(user).where(ne(user.email, ADMIN_EMAIL));
    return res.json(users);
  } catch (err) {
    console.error('admin.users.get.failed', err);
    return res.status(500).json({ error: 'Failed to get users' });
  }
}

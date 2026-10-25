import type { Request, Response } from 'express';
import { getAuth } from '../../../../lib/auth/auth.js';

export default async function handler(req: Request, res: Response) {
  // Only allow POST with the correct secret header to prevent abuse
  const secret = req.headers['x-seed-secret'];
  if (secret !== 'atrc-seed-2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const auth = getAuth();
    const result = await auth.api.signUpEmail({
      body: {
        name: 'ATRC Admin',
        email: 'anotoreviewcenter@gmail.com',
        password: 'ATRCadmin2026!',
      },
    });
    return res.json({ ok: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(400).json({ error: msg });
  }
}

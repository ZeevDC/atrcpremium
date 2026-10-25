import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

/**
 * GET /api/user/preferences
 * Returns the logged-in user's saved preferences (theme, etc.)
 * Requires: Authorization: Bearer <token>
 */
export default async function handler(req: Request, res: Response) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rows = await db.execute(sql`
      SELECT u.id, u.theme
      FROM \`session\` s
      INNER JOIN \`user\` u ON u.id = s.user_id
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
      LIMIT 1
    `);
    const data = (rows as unknown as Array<Array<{id: string; theme: string | null}>>)[0];
    if (!data || data.length === 0) return res.status(401).json({ error: 'Invalid session' });
    return res.json({ theme: data[0].theme ?? 'atrc-og-light' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

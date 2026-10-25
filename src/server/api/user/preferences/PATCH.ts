import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { sql } from 'drizzle-orm';

// Only one theme remains — atrc-og-light

/**
 * PATCH /api/user/preferences
 * Saves the logged-in user's preferences (theme, etc.)
 * Body: { theme: string }
 * Requires: Authorization: Bearer <token>
 */
export default async function handler(req: Request, res: Response) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7).trim();
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { theme } = req.body as { theme?: string };
  // Theme is always resolved to atrc-og-light — picker removed

  try {
    // Resolve userId from session token
    const rows = await db.execute(sql`
      SELECT s.user_id
      FROM \`session\` s
      WHERE s.token = ${token}
        AND s.expires_at > NOW()
      LIMIT 1
    `);
    const data = (rows as unknown as Array<Array<{user_id: string}>>)[0];
    if (!data || data.length === 0) return res.status(401).json({ error: 'Invalid session' });
    const userId = data[0].user_id;

    // Update theme if provided (column may not exist yet — wrapped in try/catch)
    if (theme !== undefined) {
      try {
        await db.execute(sql`UPDATE \`user\` SET theme = 'atrc-og-light' WHERE id = ${userId}`);
      } catch {
        // Column doesn't exist yet — migration hasn't run; silently ignore
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}

import type { Request, Response } from 'express';
import { db } from '../../db/client.js';
import { sql } from 'drizzle-orm';
import { getDatabaseCredentials } from '../../db/config.js';

export default async function handler(_req: Request, res: Response) {
  try {
    const creds = getDatabaseCredentials();
    const dbName = creds.database;

    const cols = await db.execute(sql`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ${dbName} AND TABLE_NAME = 'materials'
      ORDER BY ORDINAL_POSITION
    `);

    const count = await db.execute(sql`SELECT COUNT(*) as total FROM \`materials\``);

    const sample = await db.execute(sql`
      SELECT \`id\`, \`name\`, \`type\`, \`published\`, \`uploaded_at\`
      FROM \`materials\`
      LIMIT 5
    `);

    const colNames = (cols as unknown as Array<Array<{COLUMN_NAME: string}>>)[0]?.map(c => c.COLUMN_NAME) ?? [];
    const total = (count as unknown as Array<Array<{total: number}>>)[0]?.[0]?.total ?? 0;
    const rows = (sample as unknown as Array<Array<Record<string,unknown>>>)[0] ?? [];

    return res.json({ db: dbName, columns: colNames, total, rows });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

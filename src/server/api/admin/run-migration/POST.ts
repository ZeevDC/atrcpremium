import type { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from '../../../db/config.js';
import { requireAdmin } from '../middleware.js';

export { requireAdmin };

export default async function handler(_req: Request, res: Response) {
  const creds = getDatabaseCredentials();
  let conn: mysql.Connection | null = null;
  const results: string[] = [];

  try {
    conn = await mysql.createConnection({
      host: creds.host, port: creds.port, user: creds.user,
      password: creds.password, database: creds.database,
      ssl: { rejectUnauthorized: false },
    });

    // ── materials columns ─────────────────────────────────────────────────────
    const columnsToAdd: Array<{ table: string; column: string; definition: string }> = [
      { table: 'materials', column: 'thumbnail_path', definition: 'VARCHAR(500)' },
      { table: 'materials', column: 'sort_order',     definition: "VARCHAR(10) NOT NULL DEFAULT '0'" },
      { table: 'materials', column: 'scheduled_at',   definition: 'TIMESTAMP NULL' },
      { table: 'materials', column: 'deleted_at',     definition: 'TIMESTAMP NULL' },
      { table: 'materials', column: 'password_hash',  definition: 'VARCHAR(255)' },
      { table: 'materials', column: 'created_at',     definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { table: 'materials', column: 'updated_at',     definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
      // ── user columns ───────────────────────────────────────────────────────
      { table: 'user', column: 'theme', definition: "VARCHAR(50) NOT NULL DEFAULT 'atrc-og-light'" },
    ];

    for (const { table, column, definition } of columnsToAdd) {
      const [rows] = await conn.execute<mysql.RowDataPacket[]>(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [creds.database, table, column],
      );
      if (rows.length > 0) {
        results.push(`already_exists: ${table}.${column}`);
        continue;
      }
      await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      results.push(`added: ${table}.${column}`);
    }

    return res.json({ ok: true, results });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err), results });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

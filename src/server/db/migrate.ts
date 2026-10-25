/**
 * Lightweight startup migration — adds columns that were introduced after the
 * initial table creation. Checks INFORMATION_SCHEMA before each ALTER so it
 * is safe to run on every boot (no-op when the column already exists).
 */
import mysql from 'mysql2/promise';
import { getDatabaseCredentials } from './config.js';

export async function runStartupMigrations(): Promise<void> {
  const creds = getDatabaseCredentials();
  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection({
      host: creds.host,
      port: creds.port,
      user: creds.user,
      password: creds.password,
      database: creds.database,
      ssl: { rejectUnauthorized: false },
    });

    const columnsToAdd: Array<{ column: string; definition: string }> = [
      { column: 'created_at',    definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { column: 'updated_at',    definition: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
      { column: 'thumbnail_path',definition: 'VARCHAR(500)' },
      { column: 'scheduled_at',  definition: 'TIMESTAMP NULL' },
      { column: 'deleted_at',    definition: 'TIMESTAMP NULL' },
      { column: 'password_hash', definition: 'VARCHAR(255)' },
    ];

    for (const { column, definition } of columnsToAdd) {
      try {
        const [rows] = await conn.execute<mysql.RowDataPacket[]>(
          'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
          [creds.database, 'materials', column],
        );
        if (rows.length > 0) {
          console.log(`[migration] Already exists: materials.${column}`);
          continue;
        }
        await conn.execute(`ALTER TABLE \`materials\` ADD COLUMN \`${column}\` ${definition}`);
        console.log(`[migration] Added: materials.${column}`);
      } catch (err) {
        console.warn(`[migration] Failed materials.${column}: ${String(err)}`);
      }
    }

    // Bookmarks were introduced after the original materials schema. Some
    // deployed databases never received this table, which makes
    // GET /api/materials/bookmarks fail even when the materials table works.
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`material_bookmarks\` (
        \`id\` VARCHAR(36) NOT NULL,
        \`material_id\` VARCHAR(36) NOT NULL,
        \`user_id\` VARCHAR(36) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_material_bookmarks_user_id\` (\`user_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('[migration] material_bookmarks table is ready');
  } catch (err) {
    console.error('[migration] Could not connect for migrations:', String(err));
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

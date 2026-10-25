/**
 * Drizzle's mysql2 `db.execute()` returns the raw mysql2 tuple: [rows, fields].
 * API handlers that need SELECT rows should unwrap the first element before
 * mapping it. Keep a guard for already-unwrapped arrays to support callers
 * and runtime versions that return rows directly.
 */
export function rawRows<T = Record<string, unknown>>(result: unknown): T[] {
  if (!Array.isArray(result)) return [];

  const [rows, fields] = result;
  const isFieldPacketList = Array.isArray(fields) && fields.every((field) =>
    field !== null && typeof field === 'object' &&
    ('name' in field || 'columnType' in field || 'columnLength' in field),
  );

  if (Array.isArray(rows) && isFieldPacketList) return rows as T[];
  return result as T[];
}

import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';
import { db } from '../../../db/client.js';
import {
  user,
  session,
  allowedEmails,
  studentAccess,
  accessAuditLog,
  studyLogs,
  userStats,
} from '../../../db/schema.js';
import fs from 'node:fs';
import path from 'node:path';

export interface BackupResult {
  success: boolean;
  timestamp: string;
  tablesExported: string[];
  error?: string;
}

/** Collect all DB tables + /private JSON files and push to Cloudflare Worker */
export async function runBackup(): Promise<BackupResult> {
  const workerUrl = getSecret('CLOUDFLARE_WORKER_URL');
  const workerSecret = getSecret('CLOUDFLARE_WORKER_SECRET');
  const timestamp = new Date().toISOString();

  if (!workerUrl || !workerSecret) {
    return { success: false, timestamp, tablesExported: [], error: 'CLOUDFLARE_WORKER_URL or CLOUDFLARE_WORKER_SECRET not configured' };
  }

  // Dump all DB tables
  const [users, sessions, emails, access, auditLogs, logs, stats] = await Promise.all([
    db.select().from(user),
    db.select().from(session),
    db.select().from(allowedEmails),
    db.select().from(studentAccess),
    db.select().from(accessAuditLog),
    db.select().from(studyLogs),
    db.select().from(userStats),
  ]);

  const tablesExported = ['user', 'session', 'allowed_emails', 'student_access', 'access_audit_log', 'study_logs', 'user_stats'];

  // Collect /private JSON files
  const privateFiles: Record<string, unknown> = {};
  const privateDir = '/private';
  try {
    if (fs.existsSync(privateDir)) {
      const entries = fs.readdirSync(privateDir, { recursive: true }) as string[];
      for (const entry of entries) {
        const fullPath = path.join(privateDir, entry);
        if (fs.statSync(fullPath).isFile() && entry.endsWith('.json')) {
          try {
            privateFiles[entry] = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          } catch {
            // skip unreadable files
          }
        }
      }
    }
  } catch {
    // /private may not exist in all environments
  }

  const payload = {
    timestamp,
    source: 'atrcpremium.com',
    database: { user: users, session: sessions, allowed_emails: emails, student_access: access, access_audit_log: auditLogs, study_logs: logs, user_stats: stats },
    privateFiles,
  };

  const reqHeaders = new Headers();
  reqHeaders.set('Content-Type', 'application/json');
  reqHeaders.set('X-Backup-Secret', String(workerSecret ?? ''));

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  let response: globalThis.Response;
  try {
    response = await fetch(`${workerUrl}/backup`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, timestamp, tablesExported, error: `Fetch failed: ${String(err)}` };
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    return { success: false, timestamp, tablesExported, error: `Worker responded ${response.status}: ${text}` };
  }

  // Persist last backup time to /private
  try {
    fs.mkdirSync('/private', { recursive: true });
    fs.writeFileSync('/private/last-backup.json', JSON.stringify({ timestamp, tablesExported }));
  } catch {
    // non-fatal
  }

  return { success: true, timestamp, tablesExported };
}

export default async function handler(req: Request, res: Response) {
  // Respond immediately so the gateway doesn't time out on large payloads
  res.status(202).json({ accepted: true, message: 'Backup started — check logs for result.' });

  // Run backup in background
  runBackup().then((result) => {
    if (!result.success) {
      console.error('[backup] Failed:', result.error);
    } else {
      console.log(`[backup] Success at ${result.timestamp}, tables: ${result.tablesExported.join(', ')}`);
    }
  }).catch((err: unknown) => {
    console.error('[backup] Unexpected error:', err);
  });
}

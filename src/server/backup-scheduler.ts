/**
 * Nightly backup scheduler — fires at midnight PHT (UTC+8) every day.
 * Called once from entry.ts after the server starts.
 */
import { runBackup } from './api/admin/backup/POST.js';

function msUntilMidnightPHT(): number {
  // PHT = UTC+8
  const now = new Date();
  const phtOffset = 8 * 60 * 60 * 1000;
  const nowPHT = new Date(now.getTime() + phtOffset);

  // Next midnight in PHT
  const nextMidnightPHT = new Date(nowPHT);
  nextMidnightPHT.setUTCHours(0, 0, 0, 0);
  nextMidnightPHT.setUTCDate(nextMidnightPHT.getUTCDate() + 1);

  // Convert back to UTC ms from now
  const nextMidnightUTC = new Date(nextMidnightPHT.getTime() - phtOffset);
  return Math.max(nextMidnightUTC.getTime() - now.getTime(), 0);
}

export function startBackupScheduler(): void {
  const scheduleNext = () => {
    const delay = msUntilMidnightPHT();
    const hoursUntil = (delay / 1000 / 60 / 60).toFixed(1);
    console.log(`[backup-scheduler] Next automatic backup in ${hoursUntil}h (midnight PHT)`);

    setTimeout(async () => {
      console.log('[backup-scheduler] Running nightly backup…');
      try {
        const result = await runBackup();
        if (result.success) {
          console.log(`[backup-scheduler] Backup succeeded at ${result.timestamp}`);
        } else {
          console.error(`[backup-scheduler] Backup failed: ${result.error}`);
        }
      } catch (err) {
        console.error('[backup-scheduler] Unexpected error:', err);
      }
      // Schedule the next one
      scheduleNext();
    }, delay);
  };

  scheduleNext();
}

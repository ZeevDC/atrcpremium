import { db } from '../db/client.js';
import { studyLogs, userStats } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const SUBJECT_MAP: Record<string, 'hoursAbnormal' | 'hoursAssessment' | 'hoursIo' | 'hoursDevelopmental'> = {
  'Abnormal Psychology':       'hoursAbnormal',
  'Psychological Assessment':  'hoursAssessment',
  'I/O Psychology':            'hoursIo',
  'Developmental Psychology':  'hoursDevelopmental',
};

/** Recompute and upsert user_stats for a given userId from their study_logs. */
export async function recomputeStats(userId: string): Promise<void> {
  const logs = await db.select().from(studyLogs).where(eq(studyLogs.userId, userId));

  let total = 0;
  const subjectHours: Record<string, number> = {
    hoursAbnormal: 0, hoursAssessment: 0, hoursIo: 0, hoursDevelopmental: 0,
  };

  for (const log of logs) {
    const h = parseFloat(log.hours) || 0;
    total += h;
    const key = SUBJECT_MAP[log.subject];
    if (key) subjectHours[key] += h;
  }

  // Streak: consecutive unique study dates ending today or yesterday (PHT)
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const d of uniqueDates) {
    const logDate = new Date(d + 'T00:00:00+08:00');
    const diff = Math.round((cursor.getTime() - logDate.getTime()) / 86400000);
    if (diff <= 1) { streak++; cursor = logDate; } else break;
  }

  const existing = await db.select().from(userStats).where(eq(userStats.userId, userId));
  const payload = {
    totalHours:          String(total.toFixed(2)),
    streakDays:          String(streak),
    hoursAbnormal:       String(subjectHours.hoursAbnormal.toFixed(2)),
    hoursAssessment:     String(subjectHours.hoursAssessment.toFixed(2)),
    hoursIo:             String(subjectHours.hoursIo.toFixed(2)),
    hoursDevelopmental:  String(subjectHours.hoursDevelopmental.toFixed(2)),
    rank:                '0', // recalculated by leaderboard endpoint
  };

  if (existing.length) {
    await db.update(userStats).set(payload).where(eq(userStats.userId, userId));
  } else {
    await db.insert(userStats).values({ userId, ...payload });
  }
}

/** Recalculate and persist rank for all users by total hours descending. */
export async function recomputeRanks(): Promise<void> {
  const all = await db.select().from(userStats);
  all.sort((a, b) => parseFloat(b.totalHours) - parseFloat(a.totalHours));
  for (let i = 0; i < all.length; i++) {
    await db.update(userStats)
      .set({ rank: String(i + 1) })
      .where(eq(userStats.userId, all[i].userId));
  }
}

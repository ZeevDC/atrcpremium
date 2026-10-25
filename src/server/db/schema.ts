import {
  boolean,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export type PlanType = 'monthly' | 'quarterly' | 'yearly' | 'custom';
export type AccessStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'pending';

// ─── BetterAuth tables ────────────────────────────────────────────────────────

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── Allowlist ────────────────────────────────────────────────────────────────

export const allowedEmails = mysqlTable('allowed_emails', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  addedAt: timestamp('added_at').defaultNow(),
  addedBy: varchar('added_by', { length: 255 }),
  note: varchar('note', { length: 500 }),
});

// ─── Student Access ───────────────────────────────────────────────────────────
// Controls subscription access per student.

export const studentAccess = mysqlTable('student_access', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: 'cascade' }),
  planType: varchar('plan_type', { length: 20 }).notNull().default('custom'), // monthly|quarterly|yearly|custom
  startDate: varchar('start_date', { length: 10 }),   // YYYY-MM-DD in PHT
  expiryDate: varchar('expiry_date', { length: 10 }), // YYYY-MM-DD in PHT
  status: varchar('status', { length: 20 }).notNull().default('pending'), // active|expiring_soon|expired|suspended|pending
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── Access Audit Log ─────────────────────────────────────────────────────────

export const accessAuditLog = mysqlTable('access_audit_log', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  changedBy: varchar('changed_by', { length: 255 }).notNull(), // admin email
  action: varchar('action', { length: 50 }).notNull(), // grant|extend|suspend|reactivate|revoke|plan_change|expiry_change
  oldPlan: varchar('old_plan', { length: 20 }),
  newPlan: varchar('new_plan', { length: 20 }),
  oldExpiry: varchar('old_expiry', { length: 10 }),
  newExpiry: varchar('new_expiry', { length: 10 }),
  oldStatus: varchar('old_status', { length: 20 }),
  newStatus: varchar('new_status', { length: 20 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Learning Materials ───────────────────────────────────────────────────────
// Admin-uploaded files and links shown to students on the Learning Materials page.

export const materials = mysqlTable('materials', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  subject: varchar('subject', { length: 50 }).notNull().default('general'),
  category: varchar('category', { length: 50 }).notNull().default('notes'),
  type: varchar('type', { length: 20 }).notNull().default('file'), // 'file' | 'link' | 'drive_folder'
  filename: varchar('filename', { length: 500 }).notNull().default(''),
  originalName: varchar('original_name', { length: 500 }).notNull().default(''),
  mimeType: varchar('mime_type', { length: 255 }).notNull().default(''),
  size: varchar('size', { length: 20 }).notNull().default('0'),
  url: text('url').notNull(),
  watermark: boolean('watermark').notNull().default(false),
  published: boolean('published').notNull().default(true),
  uploadedBy: varchar('uploaded_by', { length: 255 }).notNull().default('admin'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
  // Step 3: thumbnail
  thumbnailPath: varchar('thumbnail_path', { length: 500 }),
  // Step 4: admin mode
  sortOrder: varchar('sort_order', { length: 10 }).notNull().default('0'),
  scheduledAt: timestamp('scheduled_at'),
  deletedAt: timestamp('deleted_at'),
  // Step 5: password protection
  passwordHash: varchar('password_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── Material Views (Step 9 analytics) ───────────────────────────────────────
export const materialViews = mysqlTable('material_views', {
  id: varchar('id', { length: 36 }).primaryKey(),
  materialId: varchar('material_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  viewedAt: timestamp('viewed_at').defaultNow(),
});

// ─── Material Notes (Step 9) ──────────────────────────────────────────────────
export const materialNotes = mysqlTable('material_notes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  materialId: varchar('material_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  content: text('content').notNull().default(''),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── Material Bookmarks (Step 9) ──────────────────────────────────────────────
export const materialBookmarks = mysqlTable('material_bookmarks', {
  id: varchar('id', { length: 36 }).primaryKey(),
  materialId: varchar('material_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Student Strikes (Step 8 anti-capture) ───────────────────────────────────
export const studentStrikes = mysqlTable('student_strikes', {
  id: varchar('id', { length: 36 }).primaryKey(),
  materialId: varchar('material_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  reason: varchar('reason', { length: 100 }).notNull().default('screen_capture'),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Study Logs ───────────────────────────────────────────────────────────────
// One row per WeBILIB study session submitted by a student.

export const studyLogs = mysqlTable('study_logs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  subject: varchar('subject', { length: 50 }).notNull(), // abnormal|assessment|io|developmental
  hours: varchar('hours', { length: 10 }).notNull(),     // stored as decimal string e.g. "1.5"
  date: varchar('date', { length: 10 }).notNull(),        // YYYY-MM-DD
  notes: text('notes'),
  proofPath: text('proof_path'),                          // /shared-storage/... server path
  proofUrl: text('proof_url'),                            // public URL for client
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// ─── User Stats ───────────────────────────────────────────────────────────────
// Denormalised stats per user — recomputed on every log mutation.
// Keeps leaderboard queries O(1) instead of scanning all logs.

export const userStats = mysqlTable('user_stats', {
  userId: varchar('user_id', { length: 36 })
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  totalHours: varchar('total_hours', { length: 20 }).notNull().default('0'),
  streakDays: varchar('streak_days', { length: 10 }).notNull().default('0'),
  // Hours per subject (stored as decimal strings)
  hoursAbnormal:     varchar('hours_abnormal',     { length: 20 }).notNull().default('0'),
  hoursAssessment:   varchar('hours_assessment',   { length: 20 }).notNull().default('0'),
  hoursIo:           varchar('hours_io',           { length: 20 }).notNull().default('0'),
  hoursDevelopmental:varchar('hours_developmental',{ length: 20 }).notNull().default('0'),
  // Completion rate 0–100 per subject (based on TOS weights: Abnormal 20%, Assessment 40%, I/O 20%, Dev 20%)
  // We track raw hours; rate is computed on read
  rank: varchar('rank', { length: 10 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

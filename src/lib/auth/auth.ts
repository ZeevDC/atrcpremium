import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getSecret } from '#airo/secrets';
import { db } from '../../server/db/client.js';
import * as schema from '../../server/db/schema.js';
import { sendEmail } from '../../server/email.js';
import { eq } from 'drizzle-orm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any = null;

export function getAuth() {
  if (_auth) return _auth;

  const secret = getSecret('BETTER_AUTH_SECRET');
  if (typeof secret !== 'string' || !secret) {
    throw new Error('BETTER_AUTH_SECRET is not configured');
  }

  _auth = betterAuth({
    secret,
    database: drizzleAdapter(db, {
      provider: 'mysql',
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    emailVerification: {
      sendVerificationEmail: async ({ user: u, url }) => {
        await sendEmail({
          fromName: 'ATRC Premium',
          to: u.email,
          subject: 'Verify your email — ATRC Premium',
          html: '<p>Hi ' + (u.name ?? u.email) + ',</p><p>Click to verify: <a href="' + url + '">' + url + '</a></p><p>Expires in 24 hours.</p><p>— ATRC Premium Team</p>',
        });
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (userData) => {
            const rows = await db
              .select()
              .from(schema.allowedEmails)
              .where(eq(schema.allowedEmails.email, userData.email.toLowerCase()))
              .limit(1);
            if (rows.length === 0) {
              throw new Error('This email is not on the access list. Please contact the administrator.');
            }
            return { data: userData };
          },
        },
      },
    },

    trustedOrigins: [
      'https://atrcpremium.com',
      'https://www.atrcpremium.com',
      'https://92aj0ll4wa.preview.c35.airoapp.ai',
      'https://92aj0ll4wa.c35.airoapp.ai',
      'http://localhost:5173',
      'http://localhost:3000',
    ],

    advanced: {
      disableCSRFCheck: true,
      useSecureCookies: true,
    },
  });

  return _auth;
}

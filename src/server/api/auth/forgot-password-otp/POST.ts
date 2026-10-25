import type { Request, Response } from 'express';
import { randomInt } from 'crypto';
import { db } from '../../../db/client.js';
import { verification } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../../../email.js';

export default async function handler(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  const normalized = email.toLowerCase().trim();
  const otp = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const id = crypto.randomUUID();

  await db.delete(verification).where(eq(verification.identifier, 'otp:' + normalized));
  await db.insert(verification).values({ id, identifier: 'otp:' + normalized, value: otp, expiresAt });

  try {
    await sendEmail({
      fromName: 'ATRC Premium',
      to: normalized,
      subject: "Ano 'To, Password Reset? — ATRC Premium",
      sameDomainFallback: true,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background:#1a1c22;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1c22;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#23262f;border-radius:16px;border:1px solid #2e3140;overflow:hidden;">
          <!-- Warning tape header -->
          <tr>
            <td style="height:8px;background:repeating-linear-gradient(45deg,#FFD700 0,#FFD700 10px,#1a1c22 10px,#1a1c22 20px);"></td>
          </tr>
          <!-- Logo / brand -->
          <tr>
            <td align="center" style="padding:32px 32px 0;">
              <img src="https://92aj0ll4wa.preview.c35.airoapp.ai/airo-assets/images/logo/horizontal" alt="ATRC Logo" width="80" height="80" style="display:block;margin:0 auto 12px;object-fit:contain;border-radius:8px;" />
              <div style="font-size:22px;font-weight:900;color:#FFD700;letter-spacing:2px;text-transform:uppercase;">ATRC PREMIUM</div>
              <div style="font-size:12px;color:#8b8fa8;margin-top:4px;letter-spacing:1px;">Review for PmLE</div>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:20px 32px 0;">
              <div style="height:1px;background:#2e3140;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px 0;">
              <p style="margin:0 0 8px;font-size:15px;color:#c8cad8;">Hi fRPm,</p>
              <p style="margin:0 0 24px;font-size:15px;color:#c8cad8;line-height:1.6;">
                We received a request to reset the password for your <strong style="color:#FFD700;">ATRC Premium</strong> account associated with <strong style="color:#e0e2f0;">${normalized}</strong>.
              </p>
              <p style="margin:0 0 12px;font-size:13px;color:#8b8fa8;text-transform:uppercase;letter-spacing:1px;">Your One-Time Password (OTP)</p>
              <!-- OTP box -->
              <div style="background:#1a1c22;border:2px solid #FFD700;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <span style="font-size:42px;font-weight:900;letter-spacing:12px;color:#FFD700;font-family:monospace;">${otp}</span>
              </div>
              <p style="margin:0 0 24px;font-size:13px;color:#8b8fa8;line-height:1.6;">
                ⏱ This OTP is valid for <strong style="color:#e0e2f0;">10 minutes</strong> only. Do not share it with anyone — ATRC staff will never ask for your OTP.
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#8b8fa8;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:#2e3140;"></div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 32px 32px;">
              <p style="margin:0;font-size:12px;color:#555870;">
                Sent by <strong style="color:#FFD700;">ATRC Premium</strong> · Ano 'To, Review Center?<br/>
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
          <!-- Warning tape footer -->
          <tr>
            <td style="height:8px;background:repeating-linear-gradient(45deg,#FFD700 0,#FFD700 10px,#1a1c22 10px,#1a1c22 20px);"></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      text: `ATRC Premium — Password Reset OTP

Hi,

Your one-time password (OTP) to reset your ATRC Premium account is:

${otp}

This OTP expires in 10 minutes. Do not share it with anyone.

If you did not request this, ignore this email.

— ATRC Premium Team`,
    });
  } catch (err) {
    console.error('email.send.failed otp', err);
    return res.status(500).json({ error: 'Failed to send OTP email. Please try again.' });
  }

  return res.json({ ok: true });
}

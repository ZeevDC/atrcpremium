import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default async function handler(_req: Request, res: Response) {
  const workerUrl = String(getSecret('CLOUDFLARE_WORKER_URL') ?? '');
  const workerSecret = String(getSecret('CLOUDFLARE_WORKER_SECRET') ?? '');

  if (!workerUrl || !workerSecret) {
    res.status(503).json({ ok: false, connected: false, error: 'Cloudflare Worker not configured.' });
    return;
  }



  try {
    const target = workerUrl.startsWith('http') ? workerUrl : `https://${workerUrl}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    let response: Response | globalThis.Response;
    try {
      response = await fetch(`${target}/latest`, {
        method: 'GET',
        headers: { 'X-ATRC-Secret': workerSecret },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!(response as globalThis.Response).ok) {
      res.status(200).json({ ok: false, connected: false, error: `Worker responded ${(response as globalThis.Response).status}` });
      return;
    }

    const data = await (response as globalThis.Response).json() as Record<string, unknown>;
    res.json({ ok: true, connected: true, ...data });
  } catch (err) {
    res.status(200).json({ ok: false, connected: false, error: String(err) });
  }
}

import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  const workerUrl = String(getSecret('CLOUDFLARE_WORKER_URL') ?? '');
  const workerSecret = String(getSecret('CLOUDFLARE_WORKER_SECRET') ?? '');

  if (!workerUrl || !workerSecret) {
    res.status(503).json({ ok: false, error: 'Cloudflare Worker not configured.' });
    return;
  }

  try {
    const payload = (req.body ?? {}) as Record<string, unknown>;
    const target = workerUrl.startsWith('http') ? workerUrl : `https://${workerUrl}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    let response: globalThis.Response;
    try {
      response = await fetch(`${target}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ATRC-Secret': workerSecret,
        },
        body: JSON.stringify({ ...payload, syncedAt: new Date().toISOString() }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      const text = await response.text();
      res.status(502).json({ ok: false, error: `Worker responded ${response.status}: ${text}` });
      return;
    }

    const data = await response.json() as Record<string, unknown>;
    res.json({ ok: true, worker: data });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}

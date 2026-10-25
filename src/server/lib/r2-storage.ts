/**
 * R2 storage helpers — all file I/O goes through the Cloudflare Worker.
 *
 * Worker endpoints:
 *   PUT    /r2/upload/:key                          — small files (≤50 MB)
 *   POST   /r2/multipart/create/:key               — start multipart upload
 *   PUT    /r2/multipart/upload/:key/:uploadId/:n  — upload one part
 *   POST   /r2/multipart/complete/:key/:uploadId   — complete multipart
 *   DELETE /r2/multipart/abort/:key/:uploadId      — abort multipart
 *   GET    /r2/download/:key                       — stream file
 *   DELETE /r2/delete/:key                         — delete file
 */
import { getSecret } from '#airo/secrets';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

function workerBase(): string {
  const url = String(getSecret('CLOUDFLARE_WORKER_URL') ?? '');
  if (!url) throw new Error('CLOUDFLARE_WORKER_URL is not configured');
  return url.startsWith('http') ? url.replace(/\/$/, '') : `https://${url.replace(/\/$/, '')}`;
}

function workerSecret(): string {
  return String(getSecret('CLOUDFLARE_WORKER_SECRET') ?? '');
}

/**
 * Low-level HTTP PUT/POST/DELETE using Node's http/https modules directly.
 * Node's native fetch() has known issues sending large Buffer bodies to
 * Cloudflare Workers — it may not stream correctly, causing 1101 errors.
 * Using http.request() gives us full control over the body stream.
 */
function nodeRequest(
  method: string,
  urlStr: string,
  headers: Record<string, string>,
  body?: Buffer | string,
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const isHttps = parsed.protocol === 'https:';
    const lib = isHttps ? https : http;

    const reqHeaders: Record<string, string> = { ...headers };
    if (body) {
      reqHeaders['Content-Length'] = String(Buffer.isBuffer(body) ? body.byteLength : Buffer.byteLength(body));
    }

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method,
        headers: reqHeaders,
        timeout: 5 * 60 * 1000, // 5 min timeout for large parts
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, text: Buffer.concat(chunks).toString('utf8') });
        });
      },
    );

    req.on('error', (err) => { console.error('[r2] nodeRequest error:', method, urlStr, err.message); reject(err); });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`R2 request timed out: ${method} ${urlStr}`));
    });

    if (body) req.write(body);
    req.end();
  });
}

/** Upload a Buffer to R2 (for files ≤50 MB). */
export async function r2Upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
  const base = workerBase();
  const secret = workerSecret();
  const url = `${base}/r2/upload/${encodeURIComponent(key)}`;

  const { status, text } = await nodeRequest('PUT', url, {
    'X-ATRC-Secret': secret,
    'Content-Type': mimeType,
  }, buffer);

  if (status < 200 || status >= 300) {
    throw new Error(`R2 upload failed (${status}): ${text}`);
  }
}

export interface R2UploadedPart {
  partNumber: number;
  etag: string;
}

/** Start an R2 multipart upload. Returns { uploadId, key }. */
export async function r2MultipartCreate(key: string, mimeType: string): Promise<{ uploadId: string; key: string }> {
  const base = workerBase();
  const secret = workerSecret();
  const url = `${base}/r2/multipart/create/${encodeURIComponent(key)}`;

  const { status, text } = await nodeRequest('POST', url, {
    'X-ATRC-Secret': secret,
    'Content-Type': mimeType,
  });

  if (status < 200 || status >= 300) {
    throw new Error(`R2 multipart create failed (${status}): ${text}`);
  }
  return JSON.parse(text) as { uploadId: string; key: string };
}

/** Upload one part of a multipart upload. partNumber is 1-based. */
export async function r2MultipartUploadPart(
  key: string,
  uploadId: string,
  partNumber: number,
  data: Buffer,
): Promise<R2UploadedPart> {
  const base = workerBase();
  const secret = workerSecret();
  const encodedKey = encodeURIComponent(key);
  const url = `${base}/r2/multipart/upload/${encodedKey}/${uploadId}/${partNumber}`;

  const { status, text } = await nodeRequest('PUT', url, {
    'X-ATRC-Secret': secret,
    'Content-Type': 'application/octet-stream',
  }, data);

  if (status < 200 || status >= 300) {
    throw new Error(`R2 multipart part ${partNumber} failed (${status}): ${text}`);
  }
  return JSON.parse(text) as R2UploadedPart;
}

/** Complete a multipart upload. */
export async function r2MultipartComplete(
  key: string,
  uploadId: string,
  uploadedParts: R2UploadedPart[],
): Promise<void> {
  const base = workerBase();
  const secret = workerSecret();
  const encodedKey = encodeURIComponent(key);
  const url = `${base}/r2/multipart/complete/${encodedKey}/${uploadId}`;
  const bodyStr = JSON.stringify({ uploadedParts });

  const { status, text } = await nodeRequest('POST', url, {
    'X-ATRC-Secret': secret,
    'Content-Type': 'application/json',
  }, Buffer.from(bodyStr));

  if (status < 200 || status >= 300) {
    throw new Error(`R2 multipart complete failed (${status}): ${text}`);
  }
}

/** Abort a multipart upload (cleanup on error). */
export async function r2MultipartAbort(key: string, uploadId: string): Promise<void> {
  const base = workerBase();
  const secret = workerSecret();
  const encodedKey = encodeURIComponent(key);
  const url = `${base}/r2/multipart/abort/${encodedKey}/${uploadId}`;
  await nodeRequest('DELETE', url, { 'X-ATRC-Secret': secret }).catch(() => { /* non-fatal */ });
}

/** Stream a file from R2 back to the Express response. */
export async function r2Stream(key: string, res: import('express').Response): Promise<void> {
  const base = workerBase();
  const secret = workerSecret();
  const urlStr = `${base}/r2/download/${encodeURIComponent(key)}`;
  const parsed = new URL(urlStr);
  const isHttps = parsed.protocol === 'https:';
  const lib = isHttps ? https : http;

  await new Promise<void>((resolve, reject) => {
    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: { 'X-ATRC-Secret': secret },
        timeout: 5 * 60 * 1000,
      },
      (workerRes) => {
        if ((workerRes.statusCode ?? 0) < 200 || (workerRes.statusCode ?? 0) >= 300) {
          const chunks: Buffer[] = [];
          workerRes.on('data', (c: Buffer) => chunks.push(c));
          workerRes.on('end', () => reject(new Error(`R2 download failed (${workerRes.statusCode}): ${Buffer.concat(chunks).toString()}`)));
          return;
        }
        const ct = workerRes.headers['content-type'] || 'application/octet-stream';
        const cl = workerRes.headers['content-length'];
        res.setHeader('Content-Type', ct);
        if (cl) res.setHeader('Content-Length', cl);
        workerRes.pipe(res);
        workerRes.on('end', resolve);
        workerRes.on('error', reject);
      },
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('R2 stream timed out')); });
    req.end();
  });
}

/** Delete a file from R2. Non-fatal if not found. */
export async function r2Delete(key: string): Promise<void> {
  const base = workerBase();
  const secret = workerSecret();
  const url = `${base}/r2/delete/${encodeURIComponent(key)}`;
  const { status, text } = await nodeRequest('DELETE', url, { 'X-ATRC-Secret': secret });
  if (status !== 200 && status !== 404) {
    console.warn(`[r2] Delete failed for ${key} (${status}): ${text}`);
  }
}

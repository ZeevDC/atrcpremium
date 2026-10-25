import type { Request, Response } from 'express';
import { getAuth } from './auth.js';
import { toNodeHandler } from 'better-auth/node';

let _handler: ReturnType<typeof toNodeHandler> | null = null;

function getHandler() {
  if (!_handler) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _handler = toNodeHandler(getAuth() as any);
  }
  return _handler;
}

/**
 * Rewrite Set-Cookie headers so they use SameSite=None; Secure.
 * This is required for the session cookie to work inside an iframe
 * (e.g. the Airo preview pane), where SameSite=Lax cookies are blocked.
 */
function patchCookiesForIframe(res: Response) {
  const _setHeader = res.setHeader.bind(res);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (res as any).setHeader = function (name: string, value: string | string[]) {
    if (name.toLowerCase() === 'set-cookie') {
      const rewrite = (cookie: string) => {
        // Remove existing SameSite directive and replace with None
        let c = cookie.replace(/;\s*SameSite=[^;]*/gi, '');
        c += '; SameSite=None; Secure';
        return c;
      };
      if (Array.isArray(value)) {
        return _setHeader(name, value.map(rewrite));
      }
      return _setHeader(name, rewrite(value));
    }
    return _setHeader(name, value);
  };
}

export async function authMiddleware(req: Request, res: Response) {
  patchCookiesForIframe(res);
  return getHandler()(req, res);
}

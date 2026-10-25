import type { Request, Response } from 'express';
import { authMiddleware } from '../../../../lib/auth/auth-middleware.js';

export default async function handler(req: Request, res: Response) {
  return authMiddleware(req, res);
}
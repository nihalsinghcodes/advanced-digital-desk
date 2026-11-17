import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from './prisma.ts';

export const SESSION_COOKIE_NAME = 'add_up_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET environment variable must be set (min 16 chars) in production.');
  }
  return 'dev-advocate-desk-fallback-secret-2026';
}

export interface SessionPayload {
  userId: string;
  email: string;
  exp: number;
}

export function signSessionToken(payload: Omit<SessionPayload, 'exp'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', getSessionSecret())
      .update(encoded)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
    if (!decoded.userId || !decoded.exp || decoded.exp < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string): void {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: SESSION_TTL_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    enrollmentNo: string | null;
    chamberAddress: string | null;
    phone: string | null;
    reminderLeadMinutes: number;
    preferredLanguage: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to access your chambers desk. / कृपया लॉगिन करें।',
    });
    return;
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    clearSessionCookie(res);
    res.status(401).json({
      error: 'Session expired or invalid. Please sign in again. / सत्र समाप्त हो गया है, कृपया पुनः लॉगिन करें।',
    });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      enrollmentNo: true,
      chamberAddress: true,
      phone: true,
      reminderLeadMinutes: true,
      preferredLanguage: true,
    },
  });

  if (!user) {
    clearSessionCookie(res);
    res.status(401).json({ error: 'Account not found.' });
    return;
  }

  req.user = user;
  next();
}

// CSRF protection for mutating API requests:
// Requires either X-Requested-With header or matching same-origin host when Origin/Referer is sent
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    next();
    return;
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        res.status(403).json({ error: 'CSRF validation failed: Cross-origin request rejected.' });
        return;
      }
    } catch {
      res.status(403).json({ error: 'Invalid request origin.' });
      return;
    }
  }

  next();
}

// Sliding-window rate limiter for authentication routes
const authAttempts = new Map<string, number[]>();

export function resetAuthRateLimiter(): void {
  authAttempts.clear();
}

export function authRateLimiter(maxAttempts = 15, windowMs = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      next();
      return;
    }

    const key = `${req.ip || 'unknown'}:${req.path}`;
    const now = Date.now();
    const history = (authAttempts.get(key) || []).filter((ts) => now - ts < windowMs);

    if (history.length >= maxAttempts) {
      res.status(429).json({
        error:
          'Too many authentication attempts. Please wait 15 minutes before trying again. / बहुत अधिक प्रयास। कृपया 15 मिनट बाद पुनः प्रयास करें।',
      });
      return;
    }

    history.push(now);
    authAttempts.set(key, history);
    next();
  };
}

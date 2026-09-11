/**
 * Centralized Production Logger Service for Sabores 4.0
 * Safely handles application logging without leaking sensitive data or JWTs.
 */

type LogLevel = 'info' | 'warn' | 'error';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const SENSITIVE_KEYS = new Set([
  'access_token',
  'refresh_token',
  'jwt',
  'token',
  'password',
  'secret',
  'authorization',
  'apikey',
  'api_key',
  'service_role',
  'private_key',
]);

const sanitizeValue = (val: any, depth = 0): any => {
  if (depth > 6) return '[MAX_DEPTH_REACHED]';
  if (val === null || val === undefined) return val;

  if (typeof val === 'string') {
    return val.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/gi, 'Bearer [REDACTED_TOKEN]');
  }

  if (val instanceof Error) {
    return {
      name: val.name,
      message: sanitizeValue(val.message, depth + 1),
      stack: isDev ? val.stack : undefined,
    };
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof val === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.has(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeValue(val[key], depth + 1);
      }
    }
    return sanitized;
  }

  return val;
};

export const Logger = {
  info: (message: string, ...args: any[]) => {
    if (isDev) {
      console.log(`[INFO] ${sanitizeValue(message)}`, ...args.map((arg) => sanitizeValue(arg)));
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (isDev) {
      console.warn(`[WARN] ${sanitizeValue(message)}`, ...args.map((arg) => sanitizeValue(arg)));
    }
  },

  error: (message: string, ...args: any[]) => {
    // Always log errors in both dev and production for diagnostics
    console.error(`[ERROR] ${sanitizeValue(message)}`, ...args.map((arg) => sanitizeValue(arg)));
  },
};

// Central API configuration. Ported from the mobile app
// (ServeSaathi/src/api/config.ts). Mobile reads EXPO_PUBLIC_* vars; the website
// reads NEXT_PUBLIC_* so the values are inlined into the client bundle. Same
// backend, same version prefix.
const DEFAULT_BASE_URL = 'https://powderblue-rook-471609.hostingersite.com';

export const API_CONFIG = {
  /** API origin, no trailing slash and no path prefix. */
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL,
  /** Version prefix shared by every endpoint. */
  prefix: '/api/v1',
  timeout: 15000,
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  enableLogs:
    (process.env.NEXT_PUBLIC_ENABLE_LOGS ?? String(process.env.NODE_ENV !== 'production')) ===
    'true',
} as const;

/** Absolute URL for an endpoint path, e.g. apiUrl('/auth/otp/request'). */
export const apiUrl = (path: string) => `${API_CONFIG.baseUrl}${API_CONFIG.prefix}${path}`;

export default API_CONFIG;

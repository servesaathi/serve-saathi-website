// Shared API types. Ported verbatim from the mobile app
// (ServeSaathi/src/api/types.ts) — keep in sync with it.

export type ApiRole = 'customer' | 'provider' | 'family' | 'partner';

/** Full set of roles the backend can assign a user — broader than ApiRole, which is only what Join can select. */
export type UserRole = 'customer' | 'provider' | 'family' | 'partner' | 'admin' | 'super_admin';

/** Authenticated user, as returned by /auth/login and /auth/register. */
export interface User {
  id: number;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  isActive: boolean;
  isBanned: boolean;
}

/** Every successful response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  success: true;
  statusCode: number;
  timestamp: string;
  correlationId: string;
  data: T;
}

/** Error body returned by the backend (message is a string[] for validation errors). */
export interface ApiErrorBody {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  correlationId: string;
}

/** Normalized error thrown by the API layer for every failed request. */
export class ApiError extends Error {
  readonly statusCode: number;
  /** Backend error label, e.g. "Unauthorized" / "Bad Request". */
  readonly error?: string;
  /** All messages — validation errors return several. */
  readonly messages: string[];
  readonly correlationId?: string;
  readonly path?: string;
  readonly isNetworkError: boolean;

  constructor(params: {
    statusCode: number;
    messages: string[];
    error?: string;
    correlationId?: string;
    path?: string;
    isNetworkError?: boolean;
  }) {
    super(params.messages[0] ?? 'An unexpected error occurred');
    this.name = 'ApiError';
    this.statusCode = params.statusCode;
    this.error = params.error;
    this.messages = params.messages;
    this.correlationId = params.correlationId;
    this.path = params.path;
    this.isNetworkError = params.isNetworkError ?? false;
  }
}

/** User-presentable message for any error thrown by the API layer. */
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) return err.messages.join('\n');
  if (err instanceof Error && err.message) return err.message;
  return 'Something went wrong. Please try again.';
};

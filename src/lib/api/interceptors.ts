import { AxiosError, AxiosInstance } from 'axios';
import useAuthStore from '@/store/auth.store';
import { API_CONFIG } from './config';
import { ApiError, ApiErrorBody } from './types';

// Ported verbatim from the mobile app (ServeSaathi/src/api/interceptors.ts).
// Only change: the auth-store import path (@/store/auth.store).

/** Requests whose 401s mean "bad credentials", not "session expired". */
const AUTH_PATHS = ['/auth/'];

const isAuthRequest = (url?: string) => !!url && AUTH_PATHS.some((p) => url.includes(p));

const toApiError = (error: AxiosError<ApiErrorBody>): ApiError => {
  if (error.response) {
    const body = error.response.data;
    const rawMessage = body?.message;
    const messages = Array.isArray(rawMessage)
      ? rawMessage
      : [rawMessage || 'An unexpected error occurred'];
    return new ApiError({
      statusCode: error.response.status,
      error: body?.error,
      messages,
      correlationId: body?.correlationId,
      path: body?.path,
    });
  }
  // No response — timeout, DNS failure, no connectivity
  return new ApiError({
    statusCode: 0,
    messages: ['Unable to reach the server. Check your internet connection and try again.'],
    isNetworkError: true,
  });
};

/** Wires the global request/response interceptors onto an axios instance. */
export const attachInterceptors = (client: AxiosInstance): AxiosInstance => {
  client.interceptors.request.use((config) => {
    const { token } = useAuthStore.getState();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (API_CONFIG.enableLogs) {
      console.log(`[api] → ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      if (API_CONFIG.enableLogs) {
        console.log(`[api] ← ${response.status} ${response.config.url}`);
      }
      return response;
    },
    (error: AxiosError<ApiErrorBody>) => {
      const apiError = toApiError(error);
      if (API_CONFIG.enableLogs) {
        console.log(
          `[api] ✕ ${apiError.statusCode} ${error.config?.url} — ${apiError.messages.join('; ')}`
        );
      }

      // Expired/invalid session: clear auth state so the app returns to login.
      // 401s from /auth/* endpoints are credential errors (e.g. wrong OTP) and
      // must reach the caller instead.
      if (apiError.statusCode === 401 && !isAuthRequest(error.config?.url)) {
        useAuthStore.getState().logout();
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

export default attachInterceptors;

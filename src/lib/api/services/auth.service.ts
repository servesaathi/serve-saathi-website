import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope, ApiRole, User } from '../types';

export interface RequestOtpPayload {
  /** E.164 format, e.g. "+919777729450". */
  phone: string;
  role: ApiRole;
}

export interface VerifyOtpPayload {
  phone: string;
  code: string;
}

export interface VerifyOtpData {
  isNewUser: boolean;
  /** Present when isNewUser=true — pass to register(). */
  phoneVerificationToken?: string;
  /** Present when isNewUser=false — the phone belongs to an existing account and this call logged it in. */
  accessToken?: string;
  /** Present when isNewUser=false. */
  user?: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: ApiRole;
  /**
   * Token from verifyOtp. When present the backend takes phone/role from the
   * token and creates the account with the phone already verified.
   */
  phoneVerificationToken?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  /** The OTP code sent to the user's email, used as the reset token. */
  token: string;
  newPassword: string;
}

export const authService = {
  /** Sends an OTP to the given phone. */
  requestOtp: async (payload: RequestOtpPayload): Promise<void> => {
    await apiClient.post<ApiEnvelope<unknown>>(ENDPOINTS.auth.otpRequest, payload);
  },

  /** Verifies the OTP; throws ApiError(401) for a wrong/expired code. */
  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpData> => {
    const res = await apiClient.post<ApiEnvelope<VerifyOtpData>>(
      ENDPOINTS.auth.otpVerify,
      payload
    );
    return res.data.data;
  },

  /** Creates the account after phone verification; returns a logged-in session. */
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiEnvelope<AuthResponse>>(ENDPOINTS.auth.register, payload);
    return res.data.data;
  },

  /** Email/password login; throws ApiError(401) for wrong credentials. */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiEnvelope<AuthResponse>>(ENDPOINTS.auth.login, payload);
    return res.data.data;
  },

  /** Admin/staff email + password login (separate backend route from /auth/login). */
  adminLogin: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiEnvelope<AuthResponse>>(ENDPOINTS.auth.adminLogin, payload);
    return res.data.data;
  },

  /** Invalidates the current session server-side. Clear local auth state regardless. */
  logout: async (): Promise<void> => {
    await apiClient.post<ApiEnvelope<unknown>>(ENDPOINTS.auth.logout);
  },

  /** Requests a password-reset code by email. */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<void> => {
    await apiClient.post<void>(ENDPOINTS.auth.forgotPassword, payload);
  },

  /** Resets the password using the code sent by forgotPassword. */
  resetPassword: async (payload: ResetPasswordPayload): Promise<void> => {
    await apiClient.post<void>(ENDPOINTS.auth.resetPassword, payload);
  },
};

export default authService;

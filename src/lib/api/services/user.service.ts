import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope, User } from '../types';

/** PATCH /users/me — covers only name/phone/language per the live API (no email change,
 *  no password change outside the email-based forgot-password flow). */
export interface UpdateMePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  language?: string;
}

export const userService = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<ApiEnvelope<User>>(ENDPOINTS.users.me);
    return res.data.data;
  },

  updateMe: async (payload: UpdateMePayload): Promise<User> => {
    const res = await apiClient.patch<ApiEnvelope<User>>(ENDPOINTS.users.me, payload);
    return res.data.data;
  },
};

export default userService;

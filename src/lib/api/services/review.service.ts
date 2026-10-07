import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';
import { ListEnvelope, unwrapList } from './provider.service';

// /api/v1/reviews/provider/{providerId}. Ported from the mobile app
// (ServeSaathi/src/api/services/review.service.ts), which verified the
// contract live 2026-09-25:
//  - GET list is public; GET /me, PUT and DELETE need a bearer token (401 otherwise).
//  - One review per customer per provider: PUT is create-or-update, there is no POST.
//  - The backend recalculates the provider's averageRating / totalReviews on every write.

export interface ProviderReview {
  id: number;
  createdAt: string;
  updatedAt: string;
  customerId: number;
  /** Full name in list responses, but an empty string in the PUT/GET-me responses. */
  customerName: string;
  providerId: number;
  /** 1–5 */
  rating: number;
  comment: string | null;
}

export interface UpsertReviewPayload {
  rating: number;
  comment?: string;
}

export interface ReviewsQuery {
  page?: number;
  /** 1–100, default 20. */
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const reviewService = {
  list: async (providerId: number | string, params?: ReviewsQuery) => {
    const res = await apiClient.get<ListEnvelope<ProviderReview>>(
      ENDPOINTS.reviews.forProvider(providerId),
      { params }
    );
    return unwrapList(res.data);
  },

  /** The signed-in customer's own review, or null when they haven't reviewed this provider (200, not 404). */
  getMine: async (providerId: number | string): Promise<ProviderReview | null> => {
    const res = await apiClient.get<ApiEnvelope<ProviderReview | null>>(ENDPOINTS.reviews.mine(providerId));
    return res.data.data ?? null;
  },

  /** Creates the review, or replaces the existing one. `comment` may be omitted (stored as null). */
  upsert: async (providerId: number | string, payload: UpsertReviewPayload): Promise<ProviderReview> => {
    const res = await apiClient.put<ApiEnvelope<ProviderReview>>(
      ENDPOINTS.reviews.forProvider(providerId),
      payload
    );
    return res.data.data;
  },

  /** Removes my review; 404 "Review not found" if there isn't one. */
  remove: async (providerId: number | string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.reviews.forProvider(providerId));
  },
};

export default reviewService;

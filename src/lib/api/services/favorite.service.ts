import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';
import type { ProviderListItem } from './provider.service';

// /api/v1/favorites — the signed-in user's saved providers. Every call needs
// a bearer token. POST/DELETE /favorites/{providerId} return 204 with no body.

export const favoriteService = {
  /**
   * Saved providers. Swagger types the payload as a bare Provider[]; accept
   * the `{ items }` list shape too, like every other list endpoint here.
   */
  list: async (): Promise<ProviderListItem[]> => {
    const res = await apiClient.get<ApiEnvelope<ProviderListItem[] | { items: ProviderListItem[] }>>(
      ENDPOINTS.favorites.list
    );
    const { data } = res.data;
    return Array.isArray(data) ? data : (data?.items ?? []);
  },

  add: async (providerId: number | string): Promise<void> => {
    await apiClient.post(ENDPOINTS.favorites.item(providerId));
  },

  remove: async (providerId: number | string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.favorites.item(providerId));
  },
};

export default favoriteService;

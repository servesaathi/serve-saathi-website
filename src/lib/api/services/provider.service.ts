import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';
import { Category, PaginationMeta } from './category.service';

// Public provider discovery endpoints (Swagger tags "Providers", "Services").
// All of these work without a token. Reviews live in review.service.ts,
// favourites in favorite.service.ts.

/** GET /providers list item. */
export interface ProviderListItem {
  id: number;
  verificationStatus: string;
  legalName: string | null;
  city: string | null;
  registeredAddress: string | null;
  pincodes: string[];
  bio: string | null;
  aboutText: string | null;
  isAvailable: boolean;
  bedsAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  yearsOfExperience: number | null;
  experienceCount: number | null;
  websiteUrl: string | null;
  keyFacts: string[];
  categories: Category[];
}

export interface ProvidersQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  city?: string;
  categoryId?: number;
  pincode?: string;
}

export interface ProviderServiceItem {
  id: number;
  serviceId: number;
  serviceName: string;
  serviceDescription: string | null;
  category: Category;
  effectivePrice: number | null;
  effectiveDurationMinutes: number | null;
  /** e.g. "Per Session". */
  priceTypeLabel: string | null;
}

/** GET /services/providers/{id}/profile — ProviderProfileWithServicesDto. */
export interface ProviderProfile {
  id: number;
  legalName: string | null;
  firstName?: string;
  lastName?: string;
  city: string | null;
  registeredAddress: string | null;
  pincodes: string[];
  averageRating: number;
  totalReviews: number;
  /** e.g. 27 → displayed as "27+ yrs". */
  yearsOfExperience: number | null;
  /** e.g. 25000 → displayed as "25,000+ Visits done". */
  experienceCount: number | null;
  isAvailable: boolean;
  bedsAvailable: boolean;
  bio: string | null;
  /** Main "About the facility" paragraph. */
  aboutText: string | null;
  keyFacts: string[];
  websiteUrl: string | null;
  categories: { id: number; name: string }[];
  /** Programs & Initiatives. */
  programs: { id: number; name: string }[];
  servicesProvided: ProviderServiceItem[];
  recognitions: { title: string; description?: string | null }[];
  faqs: { question: string; answer: string }[];
}

export interface ProviderAvailability {
  id: number;
  providerId: number;
  /** 0 = Sunday … 6 = Saturday (JS Date convention). */
  dayOfWeek: number;
  /** "HH:mm". */
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}

// Same quirk as categories (see category.service.ts): Swagger documents
// `data: { items, meta }`, the live backend returns `data: T[]` with `meta`
// as a sibling. Accept both so a spec-conformant backend fix doesn't break us.
export type ListEnvelope<T> = ApiEnvelope<T[] | { items: T[]; meta: PaginationMeta }> & {
  meta?: PaginationMeta;
};

export function unwrapList<T>(body: ListEnvelope<T>): { items: T[]; meta: PaginationMeta } {
  const { data } = body;
  if (Array.isArray(data)) {
    return {
      items: data,
      meta: body.meta ?? { total: data.length, page: 1, limit: data.length, totalPages: 1 },
    };
  }
  return data;
}

export const providerService = {
  getProviders: async (params?: ProvidersQuery) => {
    const res = await apiClient.get<ListEnvelope<ProviderListItem>>(ENDPOINTS.providers.list, {
      params,
    });
    return unwrapList(res.data);
  },

  getProfile: async (id: string | number): Promise<ProviderProfile> => {
    const res = await apiClient.get<ApiEnvelope<ProviderProfile>>(ENDPOINTS.providers.profile(id));
    return res.data.data;
  },

  getAvailability: async (id: string | number): Promise<ProviderAvailability[]> => {
    const res = await apiClient.get<ApiEnvelope<ProviderAvailability[]>>(
      ENDPOINTS.providers.availability(id)
    );
    return res.data.data;
  },
};

export default providerService;

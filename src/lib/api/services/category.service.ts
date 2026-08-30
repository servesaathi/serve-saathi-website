import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';

// GET /api/v1/categories (Swagger tag "Categories", https://powderblue-rook-471609.hostingersite.com/api/docs#/Categories)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  /** Non-null for a sub-category; top-level categories have parentId: null. */
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  /** Search by category name. */
  search?: string;
  parentId?: number;
  isActive?: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// The Swagger doc at /api/docs describes the success shape as
// `data: { items: Category[], meta: {...} }`, but the live backend (verified
// 2026-08-25 against the real endpoint) actually returns `data` as the bare
// Category[] with `meta` as a sibling of `data`, not nested inside it. Typed
// against the real response, not the (stale) generated doc schema.
interface CategoriesEnvelope extends ApiEnvelope<Category[]> {
  meta: PaginationMeta;
}

export const categoryService = {
  getCategories: async (
    params?: CategoriesQuery
  ): Promise<{ items: Category[]; meta: PaginationMeta }> => {
    const res = await apiClient.get<CategoriesEnvelope>(ENDPOINTS.categories.list, { params });
    return { items: res.data.data, meta: res.data.meta };
  },
};

export default categoryService;

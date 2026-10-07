import apiClient from "@/lib/api/axios";
import type { ApiEnvelope } from "@/lib/api/types";
import type { AdminDataSource } from "./source";
import type {
  AdminProvider,
  AdminUser,
  NewProviderInput,
  PageMeta,
  Paginated,
  ProviderListParams,
  ProviderUpdateInput,
  UserListParams,
} from "./types";

// Live admin data source — every call is a real backend endpoint from the
// OpenAPI spec. The bearer token comes from the admin's session (axios
// interceptor), and the backend enforces the admin role.
//
// The users module only exposes list / get / ban / unban, so `users.create`,
// `users.update` and `users.remove` are deliberately absent: the console
// disables those buttons in live mode until the backend adds endpoints.

const ADMIN_ENDPOINTS = {
  users: "/users",
  user: (id: number) => `/users/${id}`,
  ban: (id: number) => `/users/${id}/ban`,
  unban: (id: number) => `/users/${id}/unban`,
  providers: "/providers",
  providersAdmin: "/providers/admin",
  provider: (id: number) => `/providers/${id}`,
  providerStatus: (id: number) => `/providers/${id}/status`,
  providerVerify: (id: number) => `/providers/${id}/verify`,
  providerReject: (id: number) => `/providers/${id}/reject`,
  providerCommission: (id: number) => `/providers/${id}/commission`,
} as const;

async function get<T>(url: string, params?: object): Promise<T> {
  const res = await apiClient.get<ApiEnvelope<T>>(url, { params });
  return res.data.data;
}
// The live backend returns lists as `{ data: T[], meta: {...} }` — `meta` is
// a sibling of `data`, not nested inside it as the OpenAPI spec says (same
// quirk category.service.ts documents). Accept both so a spec-conformant fix
// on the backend doesn't break the console.
type ListBody<T> = ApiEnvelope<T[] | Paginated<T>> & { meta?: PageMeta };

async function list<T>(url: string, params: object, fallback: { page: number; limit: number }): Promise<Paginated<T>> {
  const res = await apiClient.get<ListBody<T>>(url, { params });
  const body = res.data;
  if (Array.isArray(body.data)) {
    const items = body.data;
    const meta = body.meta ?? {
      total: items.length,
      page: fallback.page,
      limit: fallback.limit,
      totalPages: 1,
    };
    return { items, meta };
  }
  return body.data;
}

async function patch<T>(url: string, body?: object): Promise<T> {
  const res = await apiClient.patch<ApiEnvelope<T>>(url, body);
  return res.data.data;
}

/** Drops empty strings so optional filters aren't sent as `?search=`. */
function clean<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")) as Partial<T>;
}

export const apiSource: AdminDataSource = {
  kind: "api",
  users: {
    list: (p: UserListParams) =>
      list<AdminUser>(ADMIN_ENDPOINTS.users, clean({ ...p, sortBy: "createdAt", sortOrder: "DESC" }), p),
    get: (id) => get<AdminUser>(ADMIN_ENDPOINTS.user(id)),
    ban: (id) => patch<AdminUser>(ADMIN_ENDPOINTS.ban(id)),
    unban: (id) => patch<AdminUser>(ADMIN_ENDPOINTS.unban(id)),
  },
  providers: {
    list: (p: ProviderListParams) =>
      list<AdminProvider>(ADMIN_ENDPOINTS.providersAdmin, clean({ ...p, sortBy: "createdAt", sortOrder: "DESC" }), p),
    get: (id) => get<AdminProvider>(ADMIN_ENDPOINTS.provider(id)),
    create: async (input: NewProviderInput) => {
      const res = await apiClient.post<ApiEnvelope<AdminProvider>>(ADMIN_ENDPOINTS.providers, clean(input));
      return res.data.data;
    },
    update: async (id, input: ProviderUpdateInput) => {
      const res = await apiClient.put<ApiEnvelope<AdminProvider>>(ADMIN_ENDPOINTS.provider(id), input);
      return res.data.data;
    },
    remove: async (id) => {
      await apiClient.delete(ADMIN_ENDPOINTS.provider(id));
    },
    setActive: (id, isActive) => patch<AdminProvider>(ADMIN_ENDPOINTS.providerStatus(id), { isActive }),
    verify: (id) => patch<AdminProvider>(ADMIN_ENDPOINTS.providerVerify(id)),
    reject: (id) => patch<AdminProvider>(ADMIN_ENDPOINTS.providerReject(id)),
    setCommission: (id, commissionRatePercent) =>
      patch<AdminProvider>(ADMIN_ENDPOINTS.providerCommission(id), { commissionRatePercent }),
  },
};

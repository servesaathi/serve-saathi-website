import apiClient from "@/lib/api/axios";
import { ApiError, type ApiEnvelope } from "@/lib/api/types";
import type { AdminDataSource } from "./source";
import type {
  AdminCategory,
  AdminPayment,
  AdminSubscription,
  AdminWallet,
  CategoryFilter,
  LookupEntry,
  SubscriptionPlan,
  WalletTransaction,
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
  categories: "/categories",
  categoryFilters: (slug: string) => `/categories/${encodeURIComponent(slug)}/filters`,
  payments: "/payments",
  wallet: (id: number) => `/wallet/${id}`,
  walletTransactions: (id: number) => `/wallet/${id}/transactions`,
  walletAdjust: (id: number) => `/wallet/${id}/adjust`,
  plansAdmin: "/subscription-plans/admin",
  plans: "/subscription-plans",
  plan: (id: number) => `/subscription-plans/${id}`,
  subscriptions: "/subscriptions",
  lookup: (path: string) => `/${path}`,
  lookupEntry: (path: string, id: number) => `/${path}/${id}`,
} as const;

// Lookup paths are interpolated into URLs — only allow the known slug shape.
function lookupPath(path: string): string {
  if (!/^[a-z][a-z-]*$/.test(path)) throw new Error(`Unknown lookup "${path}"`);
  return path;
}

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
  categories: {
    list: (p) => list<AdminCategory>(ADMIN_ENDPOINTS.categories, clean({ ...p, sortBy: "sortOrder", sortOrder: "ASC" }), p),
    filters: async (slug) => {
      try {
        const data = await get<CategoryFilter[] | { items: CategoryFilter[] }>(ADMIN_ENDPOINTS.categoryFilters(slug));
        return Array.isArray(data) ? data : (data?.items ?? []);
      } catch (err) {
        // Phase-2 endpoint: treat "not deployed yet" as no data, surface anything else.
        if (err instanceof ApiError && err.statusCode === 404) return null;
        throw err;
      }
    },
  },
  finance: {
    payments: (p) => list<AdminPayment>(ADMIN_ENDPOINTS.payments, clean({ ...p, sortBy: "createdAt", sortOrder: "DESC" }), p),
    wallet: (id) => get<AdminWallet>(ADMIN_ENDPOINTS.wallet(id)),
    walletTransactions: (id, p) =>
      list<WalletTransaction>(ADMIN_ENDPOINTS.walletTransactions(id), { ...p, sortBy: "createdAt", sortOrder: "DESC" }, p),
    adjustWallet: async (id, input) => {
      const res = await apiClient.post<ApiEnvelope<WalletTransaction>>(ADMIN_ENDPOINTS.walletAdjust(id), input);
      return res.data.data;
    },
  },
  plans: {
    list: (p) => list<SubscriptionPlan>(ADMIN_ENDPOINTS.plansAdmin, { ...p, sortBy: "createdAt", sortOrder: "ASC" }, p),
    create: async (input) => {
      const res = await apiClient.post<ApiEnvelope<SubscriptionPlan>>(ADMIN_ENDPOINTS.plans, input);
      return res.data.data;
    },
    update: (id, input) => patch<SubscriptionPlan>(ADMIN_ENDPOINTS.plan(id), input),
    subscriptions: (p) =>
      list<AdminSubscription>(ADMIN_ENDPOINTS.subscriptions, { ...p, sortBy: "createdAt", sortOrder: "DESC" }, p),
  },
  lookups: {
    list: (path) => get<LookupEntry[]>(ADMIN_ENDPOINTS.lookup(lookupPath(path))),
    create: async (path, input) => {
      const res = await apiClient.post<ApiEnvelope<LookupEntry>>(ADMIN_ENDPOINTS.lookup(lookupPath(path)), input);
      return res.data.data;
    },
    update: (path, id, input) => patch<LookupEntry>(ADMIN_ENDPOINTS.lookupEntry(lookupPath(path), id), input),
    remove: async (path, id) => {
      await apiClient.delete(ADMIN_ENDPOINTS.lookupEntry(lookupPath(path), id));
    },
  },
};

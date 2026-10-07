// Admin-console shapes, taken from the backend OpenAPI spec
// (/api/docs-json → components.schemas.User / Provider). Kept separate from
// src/lib/api/types.ts, which is a verbatim copy of the mobile app's types.

export const ADMIN_ROLES = ["customer", "family", "provider", "partner", "staff", "admin", "super_admin"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ROLE_LABELS: Record<AdminRole, string> = {
  customer: "Senior",
  family: "Family",
  provider: "Provider",
  partner: "Partner",
  staff: "Staff",
  admin: "Admin",
  super_admin: "Super admin",
};

export type AdminUser = {
  id: number;
  createdAt: string;
  updatedAt: string;
  email: string | null;
  phone: string | null;
  phoneVerifiedAt: string | null;
  firstName: string;
  lastName: string;
  roles: AdminRole[];
  isActive: boolean;
  isBanned: boolean;
};

export type VerificationStatus = "pending" | "verified" | "rejected";

export type AdminProvider = {
  id: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  verificationStatus: VerificationStatus;
  city: string;
  pincodes: string[];
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isActive: boolean;
  bio: string | null;
  isAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  commissionRatePercent: number;
  legalName: string | null;
  registeredAddress: string | null;
  yearsOfExperience: number | null;
  experienceCount: number | null;
  bedsAvailable: boolean;
  websiteUrl: string | null;
  aboutText: string | null;
  keyFacts: string[];
};

export type PageMeta = { total: number; page: number; limit: number; totalPages: number };
export type Paginated<T> = { items: T[]; meta: PageMeta };

export type UserListParams = { page: number; limit: number; search?: string; role?: AdminRole };
export type ProviderListParams = { page: number; limit: number; city?: string };

/** Add/edit user form. The live API has no admin endpoint for these yet. */
export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: AdminRole[];
};

/** POST /providers — RegisterProviderDto. */
export type NewProviderInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

/** PUT /providers/{id} — the UpdateProviderDto fields the console edits. */
export type ProviderUpdateInput = {
  legalName?: string;
  city?: string;
  pincodes?: string[];
  registeredAddress?: string;
  websiteUrl?: string;
  yearsOfExperience?: number;
  bio?: string;
  aboutText?: string;
  isAvailable?: boolean;
  bedsAvailable?: boolean;
};

export function displayName(p: { firstName: string | null; lastName: string | null }): string {
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "—";
}

export function providerName(p: AdminProvider): string {
  return p.legalName || displayName(p);
}

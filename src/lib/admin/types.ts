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
  /** Present when the backend includes the relation; used to prefill the Categories picker. */
  categories?: { id: number; name: string }[];
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
  /** Links the provider to categories (onboarding step 4). Only sent when changed. */
  categoryIds?: number[];
};

export function displayName(p: { firstName: string | null; lastName: string | null }): string {
  return `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || "—";
}

export function providerName(p: AdminProvider): string {
  return p.legalName || displayName(p);
}

/* ---------- Categories (GET /categories; create/update/delete disabled server-side) ---------- */

export type AdminCategory = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
};

export type CategoryListParams = { page: number; limit: number; search?: string; isActive?: boolean };

/**
 * GET /categories/:slug/filters — backend design phase 2, not deployed yet
 * (404). The final shape isn't published, so only the fields the console
 * displays are named; everything else is passed through.
 */
export type CategoryFilter = {
  id?: number;
  key?: string;
  name?: string;
  label?: string;
  type?: string;
  options?: { label?: string; name?: string; value?: string }[];
  [extra: string]: unknown;
};

/* ---------- Finance (backend: modules/payments, modules/wallet) ---------- */

export type PaymentStatus = "succeeded" | "refunded";
export type PaymentSource = "gateway" | "wallet";

export type AdminPayment = {
  id: number;
  createdAt: string;
  bookingId: number;
  customerId: number;
  providerId: number;
  amount: number;
  currency: string;
  source: PaymentSource;
  status: PaymentStatus;
  gatewayTransactionId: string | null;
  refundedAt: string | null;
};

export type PaymentListParams = { page: number; limit: number; status?: PaymentStatus };

export type AdminWallet = {
  id: number;
  createdAt: string;
  updatedAt: string;
  customerId: number | null;
  providerId: number | null;
  balance: number;
};

export type WalletTransactionReason = "booking_payout" | "booking_payment" | "refund" | "admin_adjustment";

export type WalletTransaction = {
  id: number;
  createdAt: string;
  walletId: number;
  type: "credit" | "debit";
  reason: WalletTransactionReason;
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: number | null;
  note: string | null;
  createdBy: number | null;
};

/** POST /wallet/:id/adjust — AdjustWalletDto (note: min 3 chars). */
export type WalletAdjustInput = { direction: "credit" | "debit"; amount: number; note: string };

/* ---------- Subscriptions (backend: modules/subscriptions) ---------- */

export type SubscriptionPlan = {
  id: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string | null;
  benefits: string[];
  monthlyPrice: number;
  annualPrice: number;
  isActive: boolean;
  sortOrder: number;
};

/** POST /subscription-plans (CreateSubscriptionPlanDto) / PATCH adds isActive. No delete endpoint exists. */
export type PlanInput = {
  name: string;
  description?: string;
  benefits: string[];
  monthlyPrice: number;
  annualPrice: number;
  isActive?: boolean;
};

export type SubscriptionStatus = "active" | "cancelled" | "expired" | "past_due";

export type AdminSubscription = {
  id: number;
  createdAt: string;
  customerId: number;
  planId: number;
  plan?: SubscriptionPlan;
  billingCycleId: number;
  billingCycle?: { id: number; code: string; name: string };
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
};

export type PageParams = { page: number; limit: number };

/* ---------- Master data (lookups: GET is public; POST/PATCH/DELETE admin) ---------- */

export type LookupEntry = {
  id: number;
  createdAt: string;
  updatedAt: string;
  code: string;
  name: string;
  sortOrder: number;
};

/** CreateLookupDto / UpdateLookupDto. */
export type LookupInput = { code: string; name: string; sortOrder?: number };

/**
 * Every lookup path the backend registers (shared LookupController). Grouped
 * for the Master Data sidebar; `path` is the URL segment.
 */
export const LOOKUP_GROUPS: { title: string; items: { path: string; label: string; hint: string }[] }[] = [
  {
    title: "Profile & accessibility",
    items: [
      { path: "languages", label: "Languages", hint: "Preferred language on a profile" },
      { path: "genders", label: "Genders", hint: "Sex / gender options on a profile" },
      { path: "interests", label: "Interests", hint: "Hobbies shown during profile creation" },
      { path: "color-contrasts", label: "Colour contrasts", hint: "Accessibility display modes" },
    ],
  },
  {
    title: "Care needs",
    items: [
      { path: "living-situations", label: "Living situations", hint: "Who the senior lives with" },
      { path: "dependency-levels", label: "Dependency levels", hint: "How much day-to-day help is needed" },
      { path: "medical-conditions", label: "Medical conditions", hint: "Conditions on the health profile" },
      { path: "mobility-supports", label: "Mobility supports", hint: "Walker, wheelchair and similar" },
      { path: "cognitive-conditions", label: "Cognitive conditions", hint: "Memory and cognition options" },
      { path: "family-relationships", label: "Family relationships", hint: "Son, daughter, partner…" },
    ],
  },
  {
    title: "Services & requests",
    items: [
      { path: "price-types", label: "Price types", hint: "Per hour, per session…" },
      { path: "programs", label: "Programs", hint: "Provider programs & initiatives" },
      { path: "request-types", label: "Request types", hint: "Kinds of request a family can raise" },
      { path: "reminder-lead-times", label: "Reminder lead times", hint: "How early reminders go out" },
    ],
  },
  {
    title: "Billing",
    items: [
      { path: "billing-cycles", label: "Billing cycles", hint: "Monthly, annual" },
      { path: "payment-method-types", label: "Payment method types", hint: "Card, UPI and similar" },
    ],
  },
];

export function formatINR(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

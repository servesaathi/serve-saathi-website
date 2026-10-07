import type {
  AdminCategory,
  AdminPayment,
  AdminSubscription,
  AdminWallet,
  CategoryFilter,
  CategoryListParams,
  LookupEntry,
  LookupInput,
  PageParams,
  PaymentListParams,
  PlanInput,
  SubscriptionPlan,
  WalletAdjustInput,
  WalletTransaction,
  AdminProvider,
  AdminUser,
  NewProviderInput,
  Paginated,
  ProviderListParams,
  ProviderUpdateInput,
  UserInput,
  UserListParams,
} from "./types";

// One interface, two implementations: `apiSource` (live backend) and
// `mockSource` (in-memory demo data). Screens only ever talk to
// `adminSource`, so switching is a one-line env change:
//
//   NEXT_PUBLIC_ADMIN_DATA_SOURCE=mock   → demo data, no backend needed
//   NEXT_PUBLIC_ADMIN_DATA_SOURCE=api    → live backend (default)
//
// Optional methods are ones the live backend doesn't support yet; the UI
// keeps their buttons visible but disabled, with the reason, when absent.

export interface AdminDataSource {
  kind: "api" | "mock";
  users: {
    list(params: UserListParams): Promise<Paginated<AdminUser>>;
    get(id: number): Promise<AdminUser>;
    ban(id: number): Promise<AdminUser>;
    unban(id: number): Promise<AdminUser>;
    create?(input: UserInput): Promise<AdminUser>;
    update?(id: number, input: UserInput): Promise<AdminUser>;
    remove?(id: number): Promise<void>;
  };
  providers: {
    list(params: ProviderListParams): Promise<Paginated<AdminProvider>>;
    get(id: number): Promise<AdminProvider>;
    create(input: NewProviderInput): Promise<AdminProvider>;
    update(id: number, input: ProviderUpdateInput): Promise<AdminProvider>;
    remove(id: number): Promise<void>;
    setActive(id: number, isActive: boolean): Promise<AdminProvider>;
    verify(id: number): Promise<AdminProvider>;
    reject(id: number): Promise<AdminProvider>;
    setCommission(id: number, percent: number): Promise<AdminProvider>;
  };
  categories: {
    list(params: CategoryListParams): Promise<Paginated<AdminCategory>>;
    /** Resolves `null` while the backend endpoint isn't deployed (404). */
    filters(slug: string): Promise<CategoryFilter[] | null>;
  };
  finance: {
    payments(params: PaymentListParams): Promise<Paginated<AdminPayment>>;
    wallet(id: number): Promise<AdminWallet>;
    walletTransactions(id: number, params: PageParams): Promise<Paginated<WalletTransaction>>;
    adjustWallet(id: number, input: WalletAdjustInput): Promise<WalletTransaction>;
  };
  plans: {
    list(params: PageParams): Promise<Paginated<SubscriptionPlan>>;
    create(input: PlanInput): Promise<SubscriptionPlan>;
    update(id: number, input: Partial<PlanInput>): Promise<SubscriptionPlan>;
    subscriptions(params: PageParams): Promise<Paginated<AdminSubscription>>;
  };
  lookups: {
    list(path: string): Promise<LookupEntry[]>;
    create(path: string, input: LookupInput): Promise<LookupEntry>;
    update(path: string, id: number, input: LookupInput): Promise<LookupEntry>;
    remove(path: string, id: number): Promise<void>;
  };
}

export const ADMIN_DATA_MODE: "api" | "mock" =
  process.env.NEXT_PUBLIC_ADMIN_DATA_SOURCE === "mock" ? "mock" : "api";

/** Why user add/edit/delete are disabled in live mode — shown as the button's tooltip/help text. */
export const USER_WRITE_UNSUPPORTED =
  "The backend has no admin endpoint for this yet (only list, view, ban and unban).";

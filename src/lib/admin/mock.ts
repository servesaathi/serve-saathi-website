import type { AdminDataSource } from "./source";
import type {
  AdminCategory,
  AdminPayment,
  AdminProvider,
  AdminRole,
  AdminSubscription,
  AdminUser,
  AdminWallet,
  CategoryFilter,
  LookupEntry,
  Paginated,
  ProviderUpdateInput,
  SubscriptionPlan,
  UserInput,
  WalletTransaction,
} from "./types";

// Demo data source for the admin console — same shapes and same filtering /
// paging semantics as the live API, so screens behave identically. State is
// in memory (resets on reload). Names and numbers are fictional.

const LATENCY_MS = 250;
const wait = <T,>(value: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(value)), LATENCY_MS));
const fail = (message: string) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), LATENCY_MS));

const FIRST = ["Kamala", "Ravi", "Anita", "Suresh", "Meera", "Arjun", "Lalitha", "Vikram", "Priya", "Mohan", "Sunita", "Rahul", "Geeta", "Imran", "Neha", "Joseph", "Fatima", "Harish", "Deepa", "Kiran", "Asha", "Naveen", "Pooja", "Gopal"];
const LAST = ["Sharma", "Iyer", "Patel", "Khan", "Reddy", "Nair", "Gupta", "Das", "Menon", "Singh", "Rao", "Joshi"];
const ROLE_CYCLE: AdminRole[][] = [["customer"], ["family"], ["customer"], ["provider"], ["family"], ["partner"], ["customer"], ["staff"]];

function iso(daysAgo: number): string {
  // Never in the future, whatever offsets the generators below compute.
  return new Date(Date.UTC(2026, 9, 7) - Math.max(0, daysAgo) * 86_400_000).toISOString();
}

let nextUserId = 1;
let users: AdminUser[] = Array.from({ length: 46 }, (_, i) => {
  const firstName = FIRST[i % FIRST.length];
  const lastName = LAST[(i * 5) % LAST.length];
  const id = nextUserId++;
  return {
    id,
    createdAt: iso(i * 3 + 1),
    updatedAt: iso(i),
    email: i % 7 === 3 ? null : `${firstName}.${lastName}${id}@example.com`.toLowerCase(),
    phone: i % 5 === 4 ? null : `+9198${String(76543210 + id * 1371).slice(0, 8)}`,
    phoneVerifiedAt: i % 5 === 4 ? null : iso(i * 3),
    firstName,
    lastName,
    roles: i === 0 ? ["super_admin"] : i === 1 ? ["admin"] : ROLE_CYCLE[i % ROLE_CYCLE.length],
    isActive: i % 11 !== 6,
    isBanned: i % 13 === 9,
  };
});

const ORGS = [
  ["AgeWell Foundation", "New Delhi"], ["HelpAge India", "New Delhi"], ["Dignity Foundation", "Mumbai"],
  ["Samvedna Senior Care", "Gurgaon"], ["Epoch Elder Care", "Gurgaon"], ["Silver Innings Foundation", "Mumbai"],
  ["The Good Fellows", "Pune"], ["Anandam Elder Homes", "Bengaluru"], ["Sukoon Day Care", "Chennai"],
  ["Ashraya Assisted Living", "Hyderabad"], ["Nivas Retirement Living", "Kochi"], ["Saathi Home Nursing", "Jaipur"],
  ["Prerna Rehab Centre", "Lucknow"], ["Shanti Palliative Care", "Ahmedabad"],
] as const;
const STATUS_CYCLE: AdminProvider["verificationStatus"][] = ["verified", "verified", "pending", "verified", "rejected", "pending"];

let nextProviderId = 1;
let providers: AdminProvider[] = ORGS.map(([legalName, city], i) => {
  const id = nextProviderId++;
  const [firstName, lastName] = [FIRST[(i * 3) % FIRST.length], LAST[(i * 7) % LAST.length]];
  return {
    id,
    createdAt: iso(i * 6 + 2),
    updatedAt: iso(i * 2),
    userId: 1000 + id,
    verificationStatus: STATUS_CYCLE[i % STATUS_CYCLE.length],
    city,
    pincodes: [String(110001 + i * 1013).slice(0, 6)],
    email: `contact${id}@provider.example.com`,
    firstName,
    lastName,
    phone: `+9197${String(11223344 + id * 911).slice(0, 8)}`,
    isActive: i % 6 !== 4,
    bio: null,
    isAvailable: i % 4 !== 3,
    averageRating: Math.round((4.9 - (i % 6) * 0.1) * 10) / 10,
    totalReviews: 60 - i * 4,
    commissionRatePercent: 10,
    legalName,
    registeredAddress: `${city}, India`,
    yearsOfExperience: 27 - i,
    experienceCount: 25000 - i * 1500,
    bedsAvailable: i % 3 === 0,
    websiteUrl: null,
    aboutText: null,
    keyFacts: [],
  };
});

function paginate<T>(rows: T[], page: number, limit: number): Paginated<T> {
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  return { items: rows.slice((page - 1) * limit, page * limit), meta: { total: rows.length, page, limit, totalPages } };
}

const byNewest = (a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);

function findUser(id: number) {
  return users.find((u) => u.id === id);
}
function findProvider(id: number) {
  return providers.find((p) => p.id === id);
}

function patchUser(id: number, change: Partial<AdminUser>) {
  const u = findUser(id);
  if (!u) return fail("User not found");
  Object.assign(u, change, { updatedAt: new Date().toISOString() });
  return wait(u);
}
function patchProvider(id: number, change: Partial<AdminProvider>) {
  const p = findProvider(id);
  if (!p) return fail("Provider not found");
  Object.assign(p, change, { updatedAt: new Date().toISOString() });
  return wait(p);
}

function emailTaken(email: string, exceptId?: number) {
  return users.some((u) => u.id !== exceptId && u.email?.toLowerCase() === email.toLowerCase());
}

function userFields(input: UserInput) {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone || null,
    roles: input.roles,
  };
}


/* ---------- categories (mirrors the live /categories rows, 2026-10-07) ---------- */

const CATEGORY_ROWS: [number, string, string, string | null, boolean, number][] = [
  [3, "Assisted Living", "assisted-living", "Residential facilities providing daily-living support, meals and on-site care staff.", true, 1],
  [4, "Retirement Communities", "retirement-communities", "Independent-living communities for seniors, available to rent, lease or buy.", true, 2],
  [5, "Rehabilitation Centres", "rehabilitation-centres", "Inpatient and outpatient rehabilitation, physiotherapy and recovery programmes.", true, 3],
  [6, "Palliative Care", "palliative-care", "Home-based and hospice palliative care, including free NGO and charitable providers.", true, 4],
  [7, "Diagnostic Centres", "diagnostic-centres", "Pathology labs and imaging centres, with optional home sample collection.", true, 5],
  [2, "Category 1", "category-1", null, false, 0],
];
const categories: AdminCategory[] = CATEGORY_ROWS.map(([id, name, slug, description, isActive, sortOrder]) => ({
  id, name, slug, description, isActive, sortOrder, iconUrl: null, parentId: null, createdAt: iso(23), updatedAt: iso(23),
}));

// Only Assisted Living has a sample schema — the others behave like the
// real backend today (endpoint not deployed → null).
const CATEGORY_FILTERS: Record<string, CategoryFilter[]> = {
  "assisted-living": [
    { key: "vacancy_status", label: "Vacancy status", type: "single_select", options: [{ label: "Immediate" }, { label: "Available within 1 week" }, { label: "No current vacancy" }] },
    { key: "monthly_budget", label: "Monthly budget range", type: "range", options: [{ label: "Under ₹40,000" }, { label: "₹40,000 – ₹1,00,000" }, { label: "Above ₹1,00,000" }] },
    { key: "care_mode", label: "Type of service", type: "multi_select", options: [{ label: "24/7 Care" }, { label: "Day Care" }, { label: "On-demand" }, { label: "Part time" }] },
  ],
};

/* ---------- finance ---------- */

let nextTxnId = 1;
const wallets: AdminWallet[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  createdAt: iso(60 - i * 3),
  updatedAt: iso(i),
  customerId: i % 3 === 2 ? null : 100 + i,
  providerId: i % 3 === 2 ? 1 + (i % 14) : null,
  balance: 0,
}));
const walletTxns: WalletTransaction[] = [];
for (const w of wallets) {
  for (let k = 0; k < 6 + (w.id % 5); k++) {
    const credit = k === 0 || k % 3 !== 1;
    const amount = (credit ? 1500 : 650) + ((w.id * 37 + k * 211) % 2400);
    w.balance = Math.round((w.balance + (credit ? amount : -Math.min(amount, w.balance))) * 100) / 100;
    walletTxns.push({
      id: nextTxnId++,
      createdAt: iso(60 - k * 5 - (w.id % 4)),
      walletId: w.id,
      type: credit ? "credit" : "debit",
      reason: w.providerId ? (credit ? "booking_payout" : "admin_adjustment") : credit ? (k === 0 ? "admin_adjustment" : "refund") : "booking_payment",
      amount: credit ? amount : Math.min(amount, w.balance + amount),
      balanceAfter: w.balance,
      referenceType: credit && k > 0 ? "booking" : null,
      referenceId: credit && k > 0 ? 500 + w.id * 10 + k : null,
      note: k === 0 ? "Welcome credit" : null,
      createdBy: k === 0 ? 1 : null,
    });
  }
}

const payments: AdminPayment[] = Array.from({ length: 37 }, (_, i) => ({
  id: 1000 + i,
  createdAt: iso(i * 2 + 1),
  bookingId: 500 + i,
  customerId: 100 + (i % 9),
  providerId: 1 + (i % 14),
  amount: [2400, 1850, 3490, 999, 4240, 1200][i % 6],
  currency: "INR",
  source: i % 4 === 1 ? "wallet" : "gateway",
  status: i % 7 === 3 ? "refunded" : "succeeded",
  gatewayTransactionId: i % 4 === 1 ? null : `pay_${(98765 + i * 131).toString(36)}`,
  refundedAt: i % 7 === 3 ? iso(i * 2) : null,
}));

/* ---------- subscriptions ---------- */

let nextPlanId = 4;
const plans: SubscriptionPlan[] = [
  { id: 1, name: "Foundation Tier", description: "Essential support for seniors living independently.", benefits: ["Elder Wellbeing Score check-ins", "Helpline access", "Monthly care-plan review"], monthlyPrice: 999, annualPrice: 9999, isActive: true, sortOrder: 0, createdAt: iso(80), updatedAt: iso(10) },
  { id: 2, name: "Care Plus", description: "For families coordinating regular care.", benefits: ["Everything in Foundation", "Priority callback from providers", "Family access for 3 members"], monthlyPrice: 1999, annualPrice: 19999, isActive: true, sortOrder: 1, createdAt: iso(80), updatedAt: iso(10) },
  { id: 3, name: "Family Premium (2025)", description: "Retired plan kept for existing subscribers.", benefits: ["Dedicated care manager"], monthlyPrice: 2999, annualPrice: 29999, isActive: false, sortOrder: 2, createdAt: iso(300), updatedAt: iso(60) },
];
const SUB_STATUSES: AdminSubscription["status"][] = ["active", "active", "active", "cancelled", "past_due", "expired"];
const subscriptions: AdminSubscription[] = Array.from({ length: 23 }, (_, i) => {
  const annual = i % 4 === 0;
  const start = iso(i * 4 + 2);
  return {
    id: i + 1,
    createdAt: start,
    customerId: 100 + i,
    planId: [1, 1, 2, 3][i % 4],
    billingCycleId: annual ? 2 : 1,
    billingCycle: annual ? { id: 2, code: "annual", name: "Annual" } : { id: 1, code: "monthly", name: "Monthly" },
    status: SUB_STATUSES[i % SUB_STATUSES.length],
    currentPeriodStart: start,
    currentPeriodEnd: new Date(new Date(start).getTime() + (annual ? 365 : 30) * 86_400_000).toISOString(),
    cancelledAt: SUB_STATUSES[i % SUB_STATUSES.length] === "cancelled" ? iso(i) : null,
  };
});

/* ---------- master data (seeded from the live public lookups, 2026-10-07) ---------- */

const LOOKUP_SEED: Record<string, [string, string][]> = {
  languages: [["en", "English"], ["hi", "Hindi"]],
  genders: [["female", "Female"], ["male", "Male"], ["non_binary", "Non-binary"]],
  "living-situations": [["alone", "Alone"], ["partner", "With partner"], ["family", "With family"], ["caregiver", "With a caregiver"]],
  "dependency-levels": [["independent", "Independent"], ["semi_dependent", "Semi-dependent"], ["fully_dependent", "Fully dependent"]],
  interests: [["meditation", "Meditation"], ["music", "Music"], ["yoga", "Yoga"], ["badminton", "Badminton"], ["dancing", "Dancing"], ["chess", "Chess"], ["knitting", "Knitting"], ["art_and_craft", "Art & craft"], ["party", "Party"], ["baking", "Baking"], ["carrom", "Carrom"], ["walk", "Walk"]],
  "color-contrasts": [["normal", "Normal"], ["high_contrast", "High contrast"]],
  "medical-conditions": [["arthritis", "Arthritis"], ["copd", "COPD"], ["dementia", "Dementia"], ["hypertension", "Hypertension"], ["kidney_disease", "Kidney disease"], ["alzheimers", "Alzheimer's"], ["diabetes", "Diabetes"], ["heart_disease", "Heart disease"], ["parkinsons", "Parkinson's"], ["other", "Other"]],
  "mobility-supports": [["independent", "Independent"], ["wheelchair", "Wheelchair"], ["assisted", "Assisted"], ["bedridden", "Bedridden"]],
  "cognitive-conditions": [["none", "None"], ["mild_memory_issues", "Mild memory issues"], ["dementia", "Dementia"], ["alzheimers", "Alzheimer's"]],
  "family-relationships": [["son", "Son"], ["daughter", "Daughter"], ["partner", "Partner"], ["relative", "Relative"], ["friend", "Friend"], ["other", "Other"]],
  "price-types": [["per_hour", "Per Hour"], ["per_session", "Per Session"]],
  "billing-cycles": [["monthly", "Monthly"], ["annual", "Annual"]],
  "payment-method-types": [["card", "Card"], ["paytm", "Paytm"], ["apple_pay", "Apple Pay"], ["google_pay", "Google Pay"]],
  programs: [],
  "request-types": [["direct_call", "Direct Call"], ["callback", "Request Callback"], ["site_visit", "Schedule a Site Visit"], ["virtual_consultation", "Virtual Consultation"]],
  "reminder-lead-times": [["15_min", "15 minutes before"], ["30_min", "30 minutes before"], ["1_hour", "1 hour before"], ["2_hours", "2 hours before"]],
};
let nextLookupId = 1;
const lookups: Record<string, LookupEntry[]> = Object.fromEntries(
  Object.entries(LOOKUP_SEED).map(([path, rows]) => [
    path,
    rows.map(([code, name], i) => ({ id: nextLookupId++, code, name, sortOrder: i, createdAt: iso(80), updatedAt: iso(80) })),
  ])
);
function lookupRows(path: string): LookupEntry[] {
  return (lookups[path] ??= []);
}
const bySort = (a: LookupEntry, b: LookupEntry) => a.sortOrder - b.sortOrder || a.id - b.id;

export const mockSource: AdminDataSource = {
  kind: "mock",
  users: {
    list: ({ page, limit, search, role }) => {
      const q = search?.trim().toLowerCase();
      const rows = users
        .filter((u) => !role || u.roles.includes(role))
        .filter(
          (u) =>
            !q ||
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.includes(q)
        )
        .sort(byNewest);
      return wait(paginate(rows, page, limit));
    },
    get: (id) => (findUser(id) ? wait(findUser(id)!) : fail("User not found")),
    ban: (id) => patchUser(id, { isBanned: true }),
    unban: (id) => patchUser(id, { isBanned: false }),
    create: (input) => {
      if (emailTaken(input.email)) return fail("A user with this email already exists.");
      const now = new Date().toISOString();
      const user: AdminUser = {
        id: nextUserId++,
        createdAt: now,
        updatedAt: now,
        phoneVerifiedAt: null,
        isActive: true,
        isBanned: false,
        ...userFields(input),
      };
      users = [user, ...users];
      return wait(user);
    },
    update: (id, input) => {
      if (emailTaken(input.email, id)) return fail("A user with this email already exists.");
      return patchUser(id, userFields(input));
    },
    remove: (id) => {
      if (!findUser(id)) return fail("User not found");
      users = users.filter((u) => u.id !== id);
      return wait(undefined);
    },
  },
  providers: {
    list: ({ page, limit, city }) => {
      const c = city?.trim().toLowerCase();
      const rows = providers.filter((p) => !c || p.city.toLowerCase().includes(c)).sort(byNewest);
      return wait(paginate(rows, page, limit));
    },
    get: (id) => (findProvider(id) ? wait(findProvider(id)!) : fail("Provider not found")),
    create: (input) => {
      if (providers.some((p) => p.email?.toLowerCase() === input.email.toLowerCase()))
        return fail("A provider with this email already exists.");
      const now = new Date().toISOString();
      const provider: AdminProvider = {
        id: nextProviderId++,
        createdAt: now,
        updatedAt: now,
        userId: 2000 + nextProviderId,
        verificationStatus: "pending",
        city: "",
        pincodes: [],
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone || null,
        isActive: true,
        bio: null,
        isAvailable: true,
        averageRating: 0,
        totalReviews: 0,
        commissionRatePercent: 10,
        legalName: null,
        registeredAddress: null,
        yearsOfExperience: null,
        experienceCount: null,
        bedsAvailable: false,
        websiteUrl: null,
        aboutText: null,
        keyFacts: [],
      };
      providers = [provider, ...providers];
      return wait(provider);
    },
    update: (id, input: ProviderUpdateInput) => patchProvider(id, input as Partial<AdminProvider>),
    remove: (id) => {
      if (!findProvider(id)) return fail("Provider not found");
      providers = providers.filter((p) => p.id !== id);
      return wait(undefined);
    },
    setActive: (id, isActive) => patchProvider(id, { isActive }),
    verify: (id) => patchProvider(id, { verificationStatus: "verified" }),
    reject: (id) => patchProvider(id, { verificationStatus: "rejected" }),
    setCommission: (id, commissionRatePercent) => patchProvider(id, { commissionRatePercent }),
  },
  categories: {
    list: ({ page, limit, search, isActive }) => {
      const q = search?.trim().toLowerCase();
      const rows = categories
        .filter((c) => isActive === undefined || c.isActive === isActive)
        .filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return wait(paginate(rows, page, limit));
    },
    filters: (slug) => wait(CATEGORY_FILTERS[slug] ?? null),
  },
  finance: {
    payments: ({ page, limit, status }) => wait(paginate(payments.filter((p) => !status || p.status === status).sort(byNewest), page, limit)),
    wallet: (id) => {
      const w = wallets.find((x) => x.id === id);
      return w ? wait(w) : fail(`Wallet #${id} not found`);
    },
    walletTransactions: (id, { page, limit }) =>
      wait(paginate(walletTxns.filter((t) => t.walletId === id).sort((a, b) => b.id - a.id), page, limit)),
    adjustWallet: (id, { direction, amount, note }) => {
      const w = wallets.find((x) => x.id === id);
      if (!w) return fail(`Wallet #${id} not found`);
      if (direction === "debit" && amount > w.balance) return fail("Insufficient wallet balance for this debit.");
      w.balance = Math.round((w.balance + (direction === "credit" ? amount : -amount)) * 100) / 100;
      w.updatedAt = new Date().toISOString();
      const txn: WalletTransaction = {
        id: nextTxnId++, createdAt: w.updatedAt, walletId: id, type: direction, reason: "admin_adjustment",
        amount, balanceAfter: w.balance, referenceType: null, referenceId: null, note, createdBy: 1,
      };
      walletTxns.push(txn);
      return wait(txn);
    },
  },
  plans: {
    list: ({ page, limit }) => wait(paginate([...plans].sort((a, b) => a.sortOrder - b.sortOrder), page, limit)),
    create: (input) => {
      const now = new Date().toISOString();
      const plan: SubscriptionPlan = {
        id: nextPlanId++, createdAt: now, updatedAt: now, name: input.name, description: input.description ?? null,
        benefits: input.benefits, monthlyPrice: input.monthlyPrice, annualPrice: input.annualPrice,
        isActive: input.isActive ?? true, sortOrder: plans.length,
      };
      plans.push(plan);
      return wait(plan);
    },
    update: (id, input) => {
      const plan = plans.find((x) => x.id === id);
      if (!plan) return fail("Plan not found");
      Object.assign(plan, input, { updatedAt: new Date().toISOString() });
      return wait(plan);
    },
    subscriptions: ({ page, limit }) =>
      wait(paginate(subscriptions.map((s) => ({ ...s, plan: plans.find((p) => p.id === s.planId) })).sort(byNewest), page, limit)),
  },
  lookups: {
    list: (path) => wait([...lookupRows(path)].sort(bySort)),
    create: (path, input) => {
      const rows = lookupRows(path);
      if (rows.some((r) => r.code === input.code)) return fail(`Code "${input.code}" already exists in this list.`);
      const now = new Date().toISOString();
      const entry: LookupEntry = { id: nextLookupId++, createdAt: now, updatedAt: now, code: input.code, name: input.name, sortOrder: input.sortOrder ?? rows.length };
      rows.push(entry);
      return wait(entry);
    },
    update: (path, id, input) => {
      const rows = lookupRows(path);
      const entry = rows.find((r) => r.id === id);
      if (!entry) return fail("Entry not found");
      if (rows.some((r) => r.id !== id && r.code === input.code)) return fail(`Code "${input.code}" already exists in this list.`);
      Object.assign(entry, input, { updatedAt: new Date().toISOString() });
      return wait(entry);
    },
    remove: (path, id) => {
      lookups[path] = lookupRows(path).filter((r) => r.id !== id);
      return wait(undefined);
    },
  },
};

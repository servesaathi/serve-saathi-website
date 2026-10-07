import type { AdminDataSource } from "./source";
import type { AdminProvider, AdminRole, AdminUser, Paginated, ProviderUpdateInput, UserInput } from "./types";

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
  return new Date(Date.UTC(2026, 9, 7) - daysAgo * 86_400_000).toISOString();
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
};

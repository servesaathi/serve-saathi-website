// View models for "02_Homepage / Explore Service" (Figma 3313:79715) and its
// detail/compare/callback pages, mapped from the live backend:
//   GET /providers                          → ProviderSummary (listing cards)
//   GET /services/providers/{id}/profile    → Provider (detail, compare, callback)
//   GET /providers/{id}/availability        → Availability[]
//   GET /reviews/provider/{id}              → Review[]
// Components only see these shapes, never the raw DTOs, so a backend field
// rename is a one-line fix here.
//
// ServeSaathi is a discovery platform: nothing here is bookable. A provider
// can only be contacted via "Request a Callback" (we pass the request on) or
// by visiting the provider's own website.

import type { ProviderAvailability, ProviderListItem, ProviderProfile } from "@/lib/api/services/provider.service";
import type { ProviderReview } from "@/lib/api/services/review.service";

export type ProviderSummary = {
  /** Backend id as a string — it's a URL segment everywhere it's used. */
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  /** Second item on the card's location line — the served pincodes. */
  area: string;
  tags: string[];
  verified: boolean;
};

export type ProviderService = { name: string; description: string | null; price: string | null };
export type Recognition = { title: string; description: string | null };
export type Review = { id: number; name: string; date: string; stars: number; text: string };
export type Faq = { question: string; answer: string };
export type Availability = { day: string; hours: string | null };

export type Provider = Omit<ProviderSummary, "verified" | "area"> & {
  address: string;
  website: string | null;
  bio: string | null;
  categories: string[];
  /** "27+ yrs", or null when the provider hasn't published it. */
  experience: string | null;
  /** "25,000+", or null when the provider hasn't published it. */
  visits: string | null;
  about: string | null;
  keyFacts: string[];
  programs: string[];
  services: ProviderService[];
  recognitions: Recognition[];
  faqs: Faq[];
  /** Cheapest listed service, e.g. "From ₹600 / Per Session". */
  startingPrice: string | null;
};

const displayName = (p: { id: number; legalName: string | null; firstName?: string; lastName?: string }) =>
  p.legalName?.trim() || `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim() || `Provider #${p.id}`;

const formatRupees = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

function formatPrice(amount: number | null, label: string | null): string | null {
  if (amount == null) return null;
  return label ? `${formatRupees(amount)} / ${label}` : formatRupees(amount);
}

function formatAddress(p: { registeredAddress: string | null; city: string | null; pincodes: string[] }) {
  if (p.registeredAddress?.trim()) return p.registeredAddress.trim();
  return [p.city, p.pincodes[0]].filter(Boolean).join(" ") || "Address not listed";
}

export function toProviderSummary(p: ProviderListItem): ProviderSummary {
  return {
    id: String(p.id),
    name: displayName(p),
    rating: p.averageRating,
    reviewCount: p.totalReviews,
    location: p.city ?? "Location not listed",
    area: p.pincodes.join(", "),
    tags: p.categories.map((c) => c.name),
    verified: p.verificationStatus === "verified",
  };
}

export function toProvider(p: ProviderProfile): Provider {
  const services = p.servicesProvided.map((s) => ({
    name: s.serviceName,
    description: s.serviceDescription,
    price: formatPrice(s.effectivePrice, s.priceTypeLabel),
  }));
  const cheapest = p.servicesProvided
    .filter((s) => s.effectivePrice != null)
    .sort((a, b) => a.effectivePrice! - b.effectivePrice!)[0];

  return {
    id: String(p.id),
    name: displayName(p),
    rating: p.averageRating,
    reviewCount: p.totalReviews,
    location: p.city ?? "Location not listed",
    tags: p.categories.map((c) => c.name),
    categories: p.categories.map((c) => c.name),
    address: formatAddress(p),
    website: p.websiteUrl,
    bio: p.bio,
    experience: p.yearsOfExperience != null ? `${p.yearsOfExperience}+ yrs` : null,
    visits: p.experienceCount != null ? `${p.experienceCount.toLocaleString("en-IN")}+` : null,
    about: p.aboutText ?? p.bio,
    keyFacts: p.keyFacts,
    programs: p.programs.map((x) => x.name),
    services,
    recognitions: p.recognitions.map((r) => ({ title: r.title, description: r.description ?? null })),
    faqs: p.faqs,
    startingPrice: cheapest ? `From ${formatPrice(cheapest.effectivePrice, cheapest.priceTypeLabel)}` : null,
  };
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "09:00" → "9 AM", "17:30" → "5:30 PM". */
function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

/** Monday-first week, one row per day; days with no active slot read "Not available". */
export function toAvailability(slots: ProviderAvailability[]): Availability[] {
  return [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const day = slots
      .filter((s) => s.isActive && s.dayOfWeek === dow)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    return {
      day: DAYS[dow],
      hours: day.length ? day.map((s) => `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`).join(", ") : null,
    };
  });
}

export function toReview(r: ProviderReview): Review {
  return {
    id: r.id,
    name: r.customerName,
    date: new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    stars: Math.round(r.rating),
    text: r.comment ?? "",
  };
}

/** Backend ids are numeric; anything else in the URL is a 404, not an API call. */
export const isProviderId = (id: string) => /^\d+$/.test(id);

// Figma shows the first 3 provider cards clear and the rest gated behind
// the "Unlock Pop Up" overlay — for a signed-out visitor only.
export const FREE_PROVIDER_COUNT = 3;

// Figma's listing shows 10 cards (5 rows of 2) above the pagination.
export const PROVIDERS_PER_PAGE = 10;

// Figma's compare bar has exactly three slots ("Comparing 3 of 3 items").
export const MAX_COMPARE = 3;

// The backend has no provider photos/logos yet — every card and detail page
// uses these until it does.
export const PLACEHOLDER_PHOTO = "/images/services/provider-photo-1.jpg";
export const PLACEHOLDER_GALLERY = ["/images/services/provider-hero.jpg", PLACEHOLDER_PHOTO];

/** Google Maps directions to a provider's address ("Get Directions" links). */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

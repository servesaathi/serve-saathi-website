// "02_Homepage / Explore Service" — Figma node 3313:79715. Backend has no
// providers/categories API yet (categoryService.getCategories returns 0
// items — see [[app-chrome-and-dashboard]] memory), so this page's content
// is local config mirroring the Figma frame, same pattern as
// ServiceCategoryGrid's SERVICE_CATEGORIES. Swap for a real API once one
// exists.

export const FACILITY_CATEGORIES = [
  { label: "Assisted Living", icon: "/icons/homepage/explore-category-white.svg", slug: "assisted-living" },
  { label: "Old Age Homes", icon: "/icons/homepage/explore-category-orange.svg", slug: "old-age-homes" },
  { label: "Diagnostic Hospitals", icon: "/icons/homepage/explore-category-orange.svg", slug: "diagnostic-hospitals" },
  { label: "Dialysis Centers", icon: "/icons/homepage/explore-category-orange.svg", slug: "dialysis-centers" },
  { label: "Physiotherapy Clinics", icon: "/icons/homepage/explore-category-orange.svg", slug: "physiotherapy-clinics" },
  { label: "Mental Hospital & Dementia Clinics", icon: "/icons/homepage/explore-category-orange.svg", slug: "mental-dementia-clinics" },
] as const;

export type Provider = {
  id: string;
  name: string;
  rating: number;
  location: string;
  areaOrDistance: string;
  tags: string[];
  badge?: boolean;
};

export const PROVIDERS: Provider[] = [
  { id: "agewell", name: "AgeWell Foundation", rating: 4.8, location: "Delhi", areaOrDistance: "Home visits", tags: ["Nursing", "Attendant Care", "Post-op Care"], badge: true },
  { id: "helpage", name: "HelpAge India", rating: 4.8, location: "Delhi", areaOrDistance: "Home visits", tags: ["Nursing", "Attendant Care", "Post-op Care"] },
  { id: "dignity", name: "Dignity Foundation", rating: 4.8, location: "Delhi", areaOrDistance: "20.7 km", tags: ["Nursing", "Attendant Care", "Post-op Care"] },
  { id: "samvedna", name: "Samvedna Senior Care", rating: 4.6, location: "Gurgaon", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
  { id: "agewell-2", name: "AgeWell Foundation", rating: 4.6, location: "Dwarka", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
  { id: "epoch", name: "Epoch Elder Care", rating: 4.6, location: "Gurgaon", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
  { id: "silver-innings", name: "Silver Innings Foundation", rating: 4.5, location: "Mumbai", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
  { id: "good-fellows", name: "The Good Fellows", rating: 4.5, location: "Mumbai", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
  { id: "silver-innings-2", name: "Silver Innings Foundation", rating: 4.5, location: "Mumbai", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
  { id: "good-fellows-2", name: "The Good Fellows", rating: 4.5, location: "Mumbai", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"] },
];

// Figma shows the first 3 provider cards clear and the rest gated behind
// the "Unlock Pop Up" overlay for a signed-out visitor.
export const FREE_PROVIDER_COUNT = 3;

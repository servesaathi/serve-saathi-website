// "02_Homepage / Explore Service" — Figma node 3313:79715. Backend has no
// providers/categories API yet (categoryService.getCategories returns 0
// items — see [[app-chrome-and-dashboard]] memory), so this page's content
// is local config mirroring the Figma frames, same pattern as
// ServiceCategoryGrid's SERVICE_CATEGORIES. Swap for a real API once one
// exists.
//
// ServeSaathi is a discovery platform: nothing here is bookable. A provider
// can only be contacted via "Request a Callback" (we pass the request on) or
// by visiting the provider's own website.

export const FACILITY_CATEGORIES = [
  { label: "Assisted Living", icon: "/icons/homepage/explore-category-white.svg", slug: "assisted-living" },
  { label: "Old Age Homes", icon: "/icons/homepage/explore-category-orange.svg", slug: "old-age-homes" },
  { label: "Diagnostic Hospitals", icon: "/icons/homepage/explore-category-orange.svg", slug: "diagnostic-hospitals" },
  { label: "Dialysis Centers", icon: "/icons/homepage/explore-category-orange.svg", slug: "dialysis-centers" },
  { label: "Physiotherapy Clinics", icon: "/icons/homepage/explore-category-orange.svg", slug: "physiotherapy-clinics" },
  { label: "Mental Hospital & Dementia Clinics", icon: "/icons/homepage/explore-category-orange.svg", slug: "mental-dementia-clinics" },
] as const;

export type Review = { name: string; date: string; stars: number; text: string; avatar: string };
export type Faq = { question: string; answer: string };
export type Availability = { day: string; hours: string | null };

export type Provider = {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  areaOrDistance: string;
  tags: string[];
  badge?: boolean;
  /** Logo shown in the compare bar / compare table header. */
  logo?: string;
  /** Background behind the logo in the compare header (Figma: HelpAge is yellow). */
  logoBackground?: string;
  address: string;
  website?: string;
  /** Only set where the provider has published it — never guessed. */
  phone?: string;
  email?: string;
  // Compare table rows — Figma node 3320:10405 "Group Organization".
  price: string;
  founded: string;
  mission: string;
  impact: string[];
  programs: string[];
  services: string[];
  // Detail page — Figma nodes 3337:163900 (About) / 3337:166010 (Review).
  experience: string;
  visits: string;
  about: string;
  keyFacts: string[];
  /** "Programs & Initiatives" chips on the detail page (3337:163900). */
  initiatives: string[];
  servicesOffered: string[];
  recognitions: string[];
  pricing: string;
};

// Detail-page content Figma only specifies once (for AgeWell). Shared by
// every mock provider until a real API returns per-provider values.
export const AVAILABILITY: Availability[] = [
  { day: "Monday", hours: "9 AM - 6 PM" },
  { day: "Tuesday", hours: "9 AM - 6 PM" },
  { day: "Wednesday", hours: null },
  { day: "Thursday", hours: "9 AM - 6 PM" },
  { day: "Friday", hours: "9 AM - 6 PM" },
  { day: "Saturday", hours: "9 AM - 6 PM" },
  { day: "Sunday", hours: null },
];

export const REVIEWS: Review[] = [
  {
    name: "Lalitha R,",
    date: "Mar 28, 2026",
    stars: 4,
    text: "Punctual and respectful. Brought medicine on time. Would prefer same Saathi again.",
    avatar: "/images/services/reviewer-1.png",
  },
  {
    name: "Suresh K",
    date: "Mar 20, 2026",
    stars: 5,
    text: "Very patient and helpful. My mother-in-law feels comfortable with him. He helped her with UPI payment, doctor appointment and other.",
    avatar: "/images/services/reviewer-2.png",
  },
];

export const FAQS: Faq[] = [
  {
    question: "What services are included?",
    answer:
      "Companionship, counseling, regular check-ins, volunteer visits, escort support, and phone support are typically included.",
  },
  {
    question: "What are the visiting hours?",
    answer: "Visiting hours are listed under “Availability this week”. Confirm exact timings with the provider on your callback.",
  },
  {
    question: "What is the admission process?",
    answer: "Request a callback and the provider will walk you through their assessment and admission steps.",
  },
  {
    question: "Is medical staff available 24/7?",
    answer:
      "Start with a callback request or visit the website. The team will guide you through assessment, intake, and onboarding.",
  },
];

const AGEWELL_DETAILS = {
  address: "Second Floor, M8A, Vinoba Puri, Block M, Part II, Lajpat Nagar, New Delhi, Delhi 110024, India",
  price: "Free",
  founded: "1999",
  mission: "Rights & dignity of elders",
  impact: ["Strong advocacy", "High trust"],
  programs: ["Strong advocacy", "Volunteer Programs"],
  services: ["Companionship Volunteers", "Emergency Helpline"],
  experience: "27+ yrs",
  visits: "25,000+",
  about:
    "AgeWell Foundation is a national-level NGO established in 1999, headquartered in New Delhi, working across 640 districts of India.",
  keyFacts: [
    "7,500 primary volunteers and 80,000 secondary volunteers",
    "Interacts with 25,000+ elderly daily",
    "Recognized by UN-DPI",
  ],
  initiatives: [
    "Weekly visits by trained counsellors",
    "24/7 Phone support",
    "Helpline Services",
    "Emotional & Social Support",
    "Assistance Services",
    "Guidance on legal, financial, health",
  ],
  servicesOffered: [
    "Companionship",
    "Counselling",
    "Regular check-in",
    "Volunteer visits",
    "Escort for errands",
    "Phone Support",
    "Hospital Visits",
  ],
  recognitions: [
    "UN ECOSOC Special Consultative",
    "UN-DPI Associate NGO Status",
    "Member of Planning Commission Working Groups",
  ],
  pricing: "FREE (government-supported helpline),\nTraining programs subsidized",
};

const HELPAGE_DETAILS = {
  ...AGEWELL_DETAILS,
  address: "C–14 Qutab Institutional Area, New Delhi – 110016",
  price: "₹20,000",
  founded: "1978",
  mission: "Improve quality of life",
  impact: ["Strong healthcare", "Very High trust"],
  programs: ["Advocacy", "Volunteer Programs", "Volunteer Programs", "Digital Literacy"],
  services: ["Companionship Limited", "Emotional Support", "Emergency Helpline", "Home Support"],
};

const DIGNITY_DETAILS = {
  ...AGEWELL_DETAILS,
  address: "Byculla Service Industries Premises, Dadoji Konddev Marg, Byculla East, Mumbai 400027, Maharashtra.",
  price: "₹20,000",
  founded: "1978",
  mission: "Improve quality of life",
  impact: ["Strong healthcare", "Very High trust"],
  programs: ["Advocacy", "Volunteer Programs", "Dignity Community Center"],
  services: ["Companionship Clubs", "Emotional Support", "Emergency Helpline"],
};

// TODO: website URLs are the organisations' public sites as best known —
// confirm each with the provider during onboarding before going live.
export const PROVIDERS: Provider[] = [
  { id: "agewell", name: "AgeWell Foundation", rating: 4.8, reviewCount: 47, location: "Delhi", areaOrDistance: "Home visits", tags: ["Nursing", "Attendant Care", "Post-op Care"], badge: true, logo: "/images/services/logos/agewell.jpg", website: "https://www.agewellfoundation.org", phone: "+91 11 2645 1200", email: "care@agewellfoundation.org", ...AGEWELL_DETAILS },
  { id: "helpage", name: "HelpAge India", rating: 4.8, reviewCount: 47, location: "Delhi", areaOrDistance: "Home visits", tags: ["Nursing", "Attendant Care", "Post-op Care"], logo: "/images/services/logos/helpage.jpg", logoBackground: "#fccd03", website: "https://www.helpageindia.org", ...HELPAGE_DETAILS },
  { id: "dignity", name: "Dignity Foundation", rating: 4.8, reviewCount: 47, location: "Delhi", areaOrDistance: "20.7 km", tags: ["Nursing", "Attendant Care", "Post-op Care"], logo: "/images/services/logos/dignity.jpg", website: "https://www.dignityfoundation.com", ...DIGNITY_DETAILS },
  { id: "samvedna", name: "Samvedna Senior Care", rating: 4.6, reviewCount: 32, location: "Gurgaon", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], website: "https://samvednacare.com", ...AGEWELL_DETAILS, address: "Gurgaon, Haryana" },
  { id: "agewell-dwarka", name: "AgeWell Foundation", rating: 4.6, reviewCount: 21, location: "Dwarka", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], logo: "/images/services/logos/agewell.jpg", website: "https://www.agewellfoundation.org", ...AGEWELL_DETAILS, address: "Dwarka, New Delhi" },
  { id: "epoch", name: "Epoch Elder Care", rating: 4.6, reviewCount: 28, location: "Gurgaon", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], website: "https://www.epocheldercare.com", ...AGEWELL_DETAILS, address: "Gurgaon, Haryana" },
  { id: "silver-innings", name: "Silver Innings Foundation", rating: 4.5, reviewCount: 19, location: "Mumbai", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], website: "https://www.silverinnings.com", ...AGEWELL_DETAILS, address: "Mumbai, Maharashtra" },
  { id: "good-fellows", name: "The Good Fellows", rating: 4.5, reviewCount: 16, location: "Mumbai", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], website: "https://www.goodfellows.in", ...AGEWELL_DETAILS, address: "Mumbai, Maharashtra" },
  { id: "silver-innings-thane", name: "Silver Innings Foundation", rating: 4.5, reviewCount: 12, location: "Thane", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], website: "https://www.silverinnings.com", ...AGEWELL_DETAILS, address: "Thane, Maharashtra" },
  { id: "good-fellows-pune", name: "The Good Fellows", rating: 4.5, reviewCount: 9, location: "Pune", areaOrDistance: "28.7 km", tags: ["Nursing", "Attendant Care", "Pick up loan"], website: "https://www.goodfellows.in", ...AGEWELL_DETAILS, address: "Pune, Maharashtra" },
];

export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

// Figma shows the first 3 provider cards clear and the rest gated behind
// the "Unlock Pop Up" overlay — for a signed-out visitor only.
export const FREE_PROVIDER_COUNT = 3;

// Figma's compare bar has exactly three slots ("Comparing 3 of 3 items").
export const MAX_COMPARE = 3;

/** Google Maps directions to a provider's address ("Get Directions" links). */
export function directionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

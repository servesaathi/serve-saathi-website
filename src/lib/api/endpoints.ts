// Endpoint map, grouped by backend module. Paths are relative to
// API_CONFIG.baseUrl + API_CONFIG.prefix (see config.ts) — add new modules
// here instead of hardcoding URLs in services/screens.
// Ported verbatim from the mobile app (ServeSaathi/src/api/endpoints.ts).
export const ENDPOINTS = {
  auth: {
    otpRequest: '/auth/otp/request',
    otpVerify: '/auth/otp/verify',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
    login: '/auth/login',
    adminLogin: '/admin/auth/login',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    me: '/users/me',
  },
  customers: {
    me: '/customers/me',
    addresses: '/customers/me/addresses',
    address: (id: string | number) => `/customers/me/addresses/${id}`,
  },
  careProfiles: {
    me: '/care-profiles/me',
    health: '/care-profiles/me/health',
    familyMembers: '/care-profiles/me/family-members',
    familyMember: (id: string | number) => `/care-profiles/me/family-members/${id}`,
  },
  services: {
    list: '/services',
    details: (id: string) => `/services/${id}`,
  },
  categories: {
    list: '/categories',
  },
  providers: {
    list: '/providers',
    /** Public detail-page payload (About tab + services with prices). */
    profile: (id: string | number) => `/services/providers/${id}/profile`,
    availability: (id: string | number) => `/providers/${id}/availability`,
  },
  reviews: {
    /** GET = paginated list (public), PUT = create-or-update my review, DELETE = remove my review. */
    forProvider: (providerId: string | number) => `/reviews/provider/${providerId}`,
    mine: (providerId: string | number) => `/reviews/provider/${providerId}/me`,
  },
  favorites: {
    /** GET = the signed-in user's saved providers. */
    list: '/favorites',
    /** POST = save, DELETE = unsave (both 204). */
    item: (providerId: string | number) => `/favorites/${providerId}`,
  },
  pincodes: {
    cities: '/pincodes/cities',
    states: '/pincodes/states',
    lookup: (pincode: string) => `/pincodes/${pincode}`,
  },
  masterData: {
    languages: '/languages',
    genders: '/genders',
    livingSituations: '/living-situations',
    dependencyLevels: '/dependency-levels',
    interests: '/interests',
    colorContrasts: '/color-contrasts',
    medicalConditions: '/medical-conditions',
    mobilitySupports: '/mobility-supports',
    cognitiveConditions: '/cognitive-conditions',
    familyRelationships: '/family-relationships',
  },
} as const;

export default ENDPOINTS;

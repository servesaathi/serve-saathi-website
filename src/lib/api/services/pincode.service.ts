import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';

// India Post pincode directory endpoints. /pincodes/cities returns postal
// *region* names ("Bangalore HQ", "North Bengal And Sikkim"), so the address
// form derives its city from a pincode lookup's districtName instead.
//
// Ported from the mobile app. Mobile lazy-`require`s the axios client (for
// Jest's node env); the web port uses a plain import.

export interface PincodeOffice {
  officeName: string;
  pincode: string;
  officeType: string;
  deliveryStatus: string;
  divisionName: string;
  regionName: string;
  circleName: string;
  taluk: string;
  districtName: string;
  stateName: string;
  telephone: string;
  relatedSuboffice: string;
  relatedHeadOffice: string;
}

// "TAMIL NADU" / "Lucknow  HQ" → "Tamil Nadu" / "Lucknow Hq" — the source data
// is ALL-CAPS with stray double spaces.
export const toTitleCase = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[\s&/-])[a-z]/g, (c) => c.toUpperCase());

// The states list contains a literal "NULL" row; both lists have padding noise.
export const normalizePlaceList = (items: unknown): string[] => {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.replace(/\s+/g, ' ').trim())
    .filter((item) => item.length > 0 && item.toUpperCase() !== 'NULL');
};

export const pincodeService = {
  getCities: async (): Promise<string[]> => {
    const res = await apiClient.get<ApiEnvelope<string[]>>(ENDPOINTS.pincodes.cities);
    return normalizePlaceList(res.data.data);
  },

  getStates: async (): Promise<string[]> => {
    const res = await apiClient.get<ApiEnvelope<string[]>>(ENDPOINTS.pincodes.states);
    return normalizePlaceList(res.data.data);
  },

  lookup: async (pincode: string): Promise<PincodeOffice[]> => {
    const res = await apiClient.get<ApiEnvelope<PincodeOffice[]>>(
      ENDPOINTS.pincodes.lookup(pincode)
    );
    return Array.isArray(res.data.data) ? res.data.data : [];
  },
};

export default pincodeService;

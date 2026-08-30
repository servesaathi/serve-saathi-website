import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';

/** PATCH /care-profiles/me — every field optional, send only what the screen collected. */
export interface CareProfilePayload {
  preferredName?: string;
  avatarUrl?: string;
  /** ISO date, e.g. "1966-04-29". */
  dateOfBirth?: string;
  genderId?: number;
  livingSituationId?: number;
  dependencyLevelId?: number;
  locationAccessEnabled?: boolean;
  interestIds?: number[];
  shareUpcomingEvents?: boolean;
  shareHealthNotes?: boolean;
  shareVisitReports?: boolean;
  shareLocation?: boolean;
  /** 1 (smallest) to 5 (largest). */
  fontSize?: number;
  voiceCommandsEnabled?: boolean;
  colorContrastId?: number;
}

/** PATCH /care-profiles/me/health. */
export interface HealthProfilePayload {
  medicalConditionIds?: number[];
  otherConditionNote?: string;
  mobilitySupportId?: number;
  cognitiveConditionId?: number;
  medicationRequired?: boolean;
  notes?: string;
}

/** Shape shared by every master-data lookup the backend nests into responses. */
export interface LookupEntity {
  id: number;
  /** Stable machine-readable value, e.g. "male". */
  code: string;
  /** Human-readable label shown in the UI. */
  name: string;
}

export interface CareProfile extends CareProfilePayload {
  id: number;
  customerId: number;
  // GET /care-profiles/me resolves the *Id fields into nested entities.
  gender?: LookupEntity | null;
  livingSituation?: LookupEntity | null;
  dependencyLevel?: LookupEntity | null;
  colorContrast?: LookupEntity | null;
  interests?: LookupEntity[];
}

export interface FamilyMember {
  id: number;
  firstName: string;
  lastName: string;
  familyRelationshipId: number;
  relationship?: LookupEntity | null;
  phone: string;
  status: 'pending' | 'accepted' | 'declined';
}

/** POST /care-profiles/me/family-members — sends the approval request to the member. */
export interface FamilyMemberPayload {
  firstName: string;
  lastName: string;
  familyRelationshipId: number;
  /** E.164 format, e.g. "+919922992299". */
  phone: string;
}

/** GET /care-profiles/me/health — the *Id fields resolved into nested entities. */
export interface HealthProfile {
  id: number;
  customerId: number;
  medicalConditions: LookupEntity[];
  otherConditionNote?: string | null;
  mobilitySupportId?: number | null;
  mobilitySupport?: LookupEntity | null;
  cognitiveConditionId?: number | null;
  cognitiveCondition?: LookupEntity | null;
  medicationRequired: boolean;
  notes?: string | null;
}

export const careProfileService = {
  getCareProfile: async (): Promise<CareProfile> => {
    const res = await apiClient.get<ApiEnvelope<CareProfile>>(ENDPOINTS.careProfiles.me);
    return res.data.data;
  },

  updateCareProfile: async (payload: CareProfilePayload): Promise<CareProfile> => {
    const res = await apiClient.patch<ApiEnvelope<CareProfile>>(
      ENDPOINTS.careProfiles.me,
      payload
    );
    return res.data.data;
  },

  getHealthProfile: async (): Promise<HealthProfile> => {
    const res = await apiClient.get<ApiEnvelope<HealthProfile>>(ENDPOINTS.careProfiles.health);
    return res.data.data;
  },

  updateHealthProfile: async (payload: HealthProfilePayload): Promise<void> => {
    await apiClient.patch<ApiEnvelope<unknown>>(ENDPOINTS.careProfiles.health, payload);
  },

  getFamilyMembers: async (): Promise<FamilyMember[]> => {
    const res = await apiClient.get<ApiEnvelope<FamilyMember[]>>(
      ENDPOINTS.careProfiles.familyMembers
    );
    return res.data.data;
  },

  addFamilyMember: async (payload: FamilyMemberPayload): Promise<FamilyMember> => {
    const res = await apiClient.post<ApiEnvelope<FamilyMember>>(
      ENDPOINTS.careProfiles.familyMembers,
      payload
    );
    return res.data.data;
  },

  updateFamilyMember: async (
    id: string | number,
    payload: Partial<FamilyMemberPayload>
  ): Promise<FamilyMember> => {
    const res = await apiClient.patch<ApiEnvelope<FamilyMember>>(
      ENDPOINTS.careProfiles.familyMember(id),
      payload
    );
    return res.data.data;
  },

  deleteFamilyMember: async (id: string | number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.careProfiles.familyMember(id));
  },
};

export default careProfileService;

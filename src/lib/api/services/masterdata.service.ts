import apiClient from '../axios';
import ENDPOINTS from '../endpoints';
import { ApiEnvelope } from '../types';

// Ported from the mobile app. The mobile version lazy-`require`s the axios
// client so Jest's node env can import it without pulling in native storage;
// on the web that isn't a concern, so this uses a plain import.

export interface MasterDataOption {
  id: string;
  label: string;
  value: string;
}

type MasterDataPayload = unknown;

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

const normalizeOption = (item: unknown): MasterDataOption | null => {
  if (typeof item === 'string') {
    const label = item.trim();
    return label ? { id: label, label, value: label } : null;
  }

  if (typeof item === 'number' || typeof item === 'boolean') {
    const label = String(item);
    return { id: label, label, value: label };
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const label = toText(
    record.label ?? record.name ?? record.displayName ?? record.value ?? record.title
  );
  const value = toText(
    record.value ??
      record.key ??
      record.code ??
      record.slug ??
      record.name ??
      record.label ??
      record.displayName ??
      record.id
  );
  const id = toText(record.id ?? value ?? label);

  if (!label || !id) {
    return null;
  }

  return {
    id,
    label,
    value: value || label,
  };
};

export const normalizeMasterDataResponse = (payload: MasterDataPayload): MasterDataOption[] => {
  if (Array.isArray(payload)) {
    return payload.map(normalizeOption).filter((item): item is MasterDataOption => item !== null);
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.items, record.results, record.options];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate
          .map(normalizeOption)
          .filter((item): item is MasterDataOption => item !== null);
      }
    }

    if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
      return normalizeMasterDataResponse(record.data);
    }
  }

  return [];
};

const getMasterData = async (endpoint: string): Promise<MasterDataOption[]> => {
  const res = await apiClient.get<ApiEnvelope<unknown> | unknown>(endpoint);
  return normalizeMasterDataResponse(res.data);
};

export const masterdataService = {
  getLanguages: () => getMasterData(ENDPOINTS.masterData.languages),
  getGenders: () => getMasterData(ENDPOINTS.masterData.genders),
  getLivingSituations: () => getMasterData(ENDPOINTS.masterData.livingSituations),
  getDependencyLevels: () => getMasterData(ENDPOINTS.masterData.dependencyLevels),
  getInterests: () => getMasterData(ENDPOINTS.masterData.interests),
  getColorContrasts: () => getMasterData(ENDPOINTS.masterData.colorContrasts),
  getMedicalConditions: () => getMasterData(ENDPOINTS.masterData.medicalConditions),
  getMobilitySupports: () => getMasterData(ENDPOINTS.masterData.mobilitySupports),
  getCognitiveConditions: () => getMasterData(ENDPOINTS.masterData.cognitiveConditions),
  getFamilyRelationships: () => getMasterData(ENDPOINTS.masterData.familyRelationships),
};

export default masterdataService;

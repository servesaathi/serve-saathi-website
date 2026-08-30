import axios from 'axios';
import { API_CONFIG } from './config';
import { attachInterceptors } from './interceptors';

// The shared axios instance every service imports as `apiClient`.
// baseURL = origin + version prefix, so endpoints.ts paths stay clean.
const apiClient = attachInterceptors(
  axios.create({
    baseURL: `${API_CONFIG.baseUrl}${API_CONFIG.prefix}`,
    headers: { 'Content-Type': 'application/json' },
    timeout: API_CONFIG.timeout,
  })
);

export default apiClient;

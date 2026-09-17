// Centralized API Base URL and client
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://drishti-backend-gateway.onrender.com'
).replace(/[\[\]"]/g, '').replace(/\/+$/, '');

export const API_BASE = API_BASE_URL;

export { apiClient, api, ENDPOINTS } from './utils/api';

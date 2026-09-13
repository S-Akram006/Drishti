import axios from 'axios';

// Sanitize API base URL resolution: remove any surrounding square brackets, quotes, markdown links, or trailing slashes
const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "https://drishti-backend-gateway.onrender.com";
const extractedUrl = String(RAW_BASE).includes('](')
  ? String(RAW_BASE).split('](')[0].replace(/^\[/, '')
  : String(RAW_BASE);

export const API_BASE_URL = extractedUrl.replace(/[\[\]"']/g, '').replace(/\/+$/, '');
export const API_BASE = API_BASE_URL;

export const ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/health`,
  SCREEN: `${API_BASE_URL}/api/screen`,
  TELEMEDICINE_QUEUE: `${API_BASE_URL}/api/telemedicine/queue`,
  TELEMEDICINE_REVIEW: (id) => `${API_BASE_URL}/api/telemedicine/review/${id}`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_USERS: `${API_BASE_URL}/api/auth/users`,
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_CREATE_STAFF: `${API_BASE_URL}/api/admin/create-staff`
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000 // 60s for deep learning Grad-CAM generation
});

export const api = {
  // Check gateway & AI microservice health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Submit patient intake & fundus image for AI screening
  screenPatient: async (formData) => {
    const res = await apiClient.post('/api/screen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  },

  // Fetch pending cases for specialist review
  getTelemedicineQueue: async () => {
    const res = await apiClient.get('/api/telemedicine/queue');
    return res.data;
  },

  // Submit ophthalmologist referral approval / override
  reviewCase: async (id, reviewData) => {
    const res = await apiClient.patch(`/api/telemedicine/review/${id}`, reviewData);
    return res.data;
  },

  // Auth: Login
  login: async (userId, password) => {
    const res = await apiClient.post('/api/auth/login', { userId, password });
    return res.data;
  },

  // Auth: Get Users list
  getUsers: async () => {
    const res = await apiClient.get('/api/auth/users');
    return res.data;
  },

  // Admin: Get Oversight Stats & Operator Performance
  getAdminStats: async () => {
    const res = await apiClient.get('/api/admin/stats');
    return res.data;
  },

  // Admin: Onboard/Create New Screener Staff
  createStaff: async (staffData) => {
    const res = await apiClient.post('/api/admin/create-staff', staffData);
    return res.data;
  }
};

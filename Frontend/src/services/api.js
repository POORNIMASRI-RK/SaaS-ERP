import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return 'https://saas-erp-s8ds.onrender.com/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor to attach JWT token to every outgoing request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        if (userObj.role === 'Super Admin') {
          const selectedTenantId = localStorage.getItem('selectedTenantId');
          if (selectedTenantId) {
            config.headers['x-tenant-id'] = selectedTenantId;
          }
        } else {
          // Non-Super Admin: ALWAYS clear selectedTenantId so API calls are strictly scoped to user.tenantId
          localStorage.removeItem('selectedTenantId');
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 unauthenticated handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/set-password') &&
        !window.location.pathname.includes('/reset-password')
      ) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

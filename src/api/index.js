import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';

export const api = axios.create({
  baseURL: baseURL ? `${baseURL.replace(/\/$/, '')}/api/v1` : '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// BE 공통 응답 래퍼 unwrap: { success, data, errorCode, message }
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      if (body.success) {
        response.data = body.data;
        return response;
      }
      const err = new Error(body.message || body.errorCode || 'API error');
      err.errorCode = body.errorCode;
      err.status = response.status;
      throw err;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const body = error.response?.data;
    if (body && typeof body === 'object' && 'errorCode' in body) {
      error.errorCode = body.errorCode;
      error.message = body.message || error.message;
    }
    if (status === 401) {
      localStorage.removeItem('accessToken');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const tokenStorage = {
  get: () => localStorage.getItem('accessToken'),
  set: (token) => localStorage.setItem('accessToken', token),
  clear: () => localStorage.removeItem('accessToken'),
  isAuthenticated: () => !!localStorage.getItem('accessToken'),
};

export default api;

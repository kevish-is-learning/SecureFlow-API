/**
 * Axios instance with:
 *  - baseURL sourced from VITE_API_URL.
 *  - Request interceptor attaching the JWT from localStorage.
 *  - Response interceptor auto-logging out on 401.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
});

export const TOKEN_KEY = 'secureflow.token';
export const USER_KEY = 'secureflow.user';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      const onAuthPage =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (!onAuthPage) window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const extractError = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (data?.details?.length) {
    return data.details.map((d) => `${d.path}: ${d.message}`).join(' · ');
  }
  return data?.message || err?.message || fallback;
};

export default api;

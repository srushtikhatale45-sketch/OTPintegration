import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://otpintegrationbackend.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true   // crucial for cookies
});

// Response interceptor to refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed – redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
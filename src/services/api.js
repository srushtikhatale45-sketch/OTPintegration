import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://otpintegrationbackend.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});

// Request interceptor (optional) – we don't need to add Authorization header
// because cookies are sent automatically with withCredentials.

// Response interceptor
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest)).catch(err => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Call the refresh token endpoint (no data needed, cookie is sent automatically)
        await api.post('/auth/refresh');
        // Refresh successful – process queued requests
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed – clear local state and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('userRole');
        window.location.href = '/user/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // For other errors (non-401 or already retried), just reject
    return Promise.reject(error);
  }
);

export default api;
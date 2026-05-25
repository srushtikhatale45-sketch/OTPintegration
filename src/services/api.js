import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://otpintegrationbackend.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true   // sends cookies automatically
});

// No request interceptor – cookies are enough

// Response interceptor – handle 401 without redirecting (components will handle)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any local state if needed, but don't redirect automatically
      localStorage.removeItem('loggedIn');
      localStorage.removeItem('userRole');
    }
    return Promise.reject(error);
  }
);

export default api;
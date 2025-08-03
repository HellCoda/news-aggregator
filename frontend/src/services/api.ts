// frontend/src/services/api.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const baseURL = process.env.REACT_APP_API_URL || (
  window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : '/api'  // En production, utilise une URL relative
);

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available (for future use)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Handle unauthorized (for future auth implementation)
          console.error('Unauthorized access');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response from server');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper functions for common HTTP methods
export const apiHelpers = {
  get: <T>(url: string, params?: any): Promise<T> => 
    api.get(url, { params }).then(res => res.data),
  
  post: <T>(url: string, data?: any): Promise<T> => 
    api.post(url, data).then(res => res.data),
  
  put: <T>(url: string, data?: any): Promise<T> => 
    api.put(url, data).then(res => res.data),
  
  delete: <T>(url: string): Promise<T> => 
    api.delete(url).then(res => res.data),
};

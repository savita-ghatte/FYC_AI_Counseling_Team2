import axios from 'axios';

// In production, the app is served from the same domain as the backend.
// In development, Vite runs on 5173 and proxies/calls to 5000.
// By using import.meta.env.VITE_API_URL, we can set it to 'http://localhost:5000/api' in .env.development
// Or just fallback to '/api' which works perfectly when served from the same domain in production.
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add interceptor to automatically refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token using httpOnly cookie
        const refreshRes = await api.post('/auth/refresh');
        
        if (refreshRes.data.status === 'success') {
          const newToken = refreshRes.data.data.accessToken;
          setAuthToken(newToken);
          
          // Update the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails (e.g. refresh token expired), clear state and redirect to login
        setAuthToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

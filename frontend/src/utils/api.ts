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

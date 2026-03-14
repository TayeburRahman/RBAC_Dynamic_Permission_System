import axios from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_BASE_API ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : '');

export const api = axios.create({
  baseURL,
  withCredentials: true, // allow httpOnly refresh cookie
});

// Attach Authorization header dynamically via a setter
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

api.interceptors.request.use((config) => {
  if (accessToken && config && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default api;

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

// Response interceptor for silent refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // If 401 and not already retried
    if (response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;
        try {
          const storedRt = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
          const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { 
            refreshToken: storedRt 
          }, { withCredentials: true });

          const { accessToken: newAt, refreshToken: newRt } = res.data.data || {};
          
          if (newAt) {
            accessToken = newAt;
            if (newRt && typeof window !== 'undefined') {
              localStorage.setItem('refreshToken', newRt);
            }
            onRefreshed(newAt);
            isRefreshing = false;
            
            originalRequest.headers.Authorization = `Bearer ${newAt}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          // Refresh failed
        }
      } else {
        // Wait for current refresh to finish
        const retryOriginalRequest = new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
        return retryOriginalRequest;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

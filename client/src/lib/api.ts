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
  // Resolve any requests waiting for the initial token
  if (token && authReadyResolve) {
    authReadyResolve();
    authReadyResolve = null;
  }
}

// Gate: requests wait until auth is initialized (first refresh completes or fails)
let authReady: Promise<void> | null = null;
let authReadyResolve: (() => void) | null = null;

function createAuthGate() {
  authReady = new Promise<void>((resolve) => {
    authReadyResolve = resolve;
  });
}

// Signal that auth initialization is done (even if no token was obtained)
export function markAuthReady() {
  if (authReadyResolve) {
    authReadyResolve();
    authReadyResolve = null;
  }
}

// Create the gate on module load (client-side only)
if (typeof window !== 'undefined') {
  createAuthGate();
}

api.interceptors.request.use(async (config) => {
  // Don't gate the refresh request itself (would deadlock)
  const isRefresh = config.url?.includes('/auth/refresh');
  const isPublic = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');

  if (!isRefresh && !isPublic && authReady) {
    await authReady; // wait until first auth refresh settles
  }

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

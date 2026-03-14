"use client";

import React from "react";
import api, { setAccessToken, markAuthReady } from "@/lib/api";
import { useAppDispatch } from '@/store/store';
import { setUser as setUserAction, setAccessToken as setAccessTokenAction, clearAuth } from '@/store/authSlice';

type User = any;

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<string>;
  verify: (payload: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (perm: string | string[]) => boolean;
  initializing: boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function useAuthContext() {
  const ctx = React.useContext(AuthContext);
  return ctx as AuthContextValue | undefined;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [accessToken, setToken] = React.useState<string | null>(null);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [initializing, setInitializing] = React.useState(true);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e) {
        // no-op
      } finally {
        markAuthReady(); // unblock queued API requests
      }
      setInitializing(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAuthData(at: string | null, rt: string | null, u: any, perms: string[]) {
    if (rt && typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', rt);
    }
    setAccessToken(at);
    setToken(at);
    setUser(u || null);
    setPermissions(perms || []);
    dispatch(setUserAction(u || null));
    dispatch(setAccessTokenAction(at || null));
  }

  async function login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken: at, refreshToken: rt, user: u, permissions: perms } = res.data.data || {};
      applyAuthData(at, rt, u, perms);

      // Dynamic redirect based on first available permission
      const userRole = u?.role?.toUpperCase();
      if (userRole === 'CUSTOMER') {
        if (perms.includes('view_dashboard')) return '/dashboard';
        if (perms.includes('view_tickets')) return '/tickets';
        if (perms.includes('order.view.own')) return '/orders';
      }
      return '/dashboard';
    } catch (err: any) {
      throw err;
    }
  }

  async function verify(payload: any) {
    try {
      const res = await api.post('/auth/verify-otp', payload);
      const { accessToken: at, refreshToken: rt, user: u, permissions: perms } = res.data.data || {};
      applyAuthData(at, rt, u, perms);
    } catch (err: any) {
      throw err;
    }
  }

  async function register(payload: any) {
    try {
      await api.post('/auth/register', payload);
    } catch (err: any) {
      throw err;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore network errors
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('refreshToken');
    }
    setAccessToken(null);
    setToken(null);
    setUser(null);
    setPermissions([]);
    dispatch(clearAuth());
  }

  async function refresh() {
    try {
      const storedRt = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
      const res = await api.post('/auth/refresh', { refreshToken: storedRt });
      const { accessToken: at, refreshToken: rt, user: u, permissions: perms } = res.data.data || {};
      if (at) {
        applyAuthData(at, rt, u, perms);
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refreshToken');
      }
      setAccessToken(null);
      setToken(null);
      setUser(null);
      setPermissions([]);
      throw err;
    }
  }

  function hasPermission(perm: string | string[]): boolean {
    if (user?.role === 'SUPER_ADMIN') return true;
    const userPerms = permissions || [];
    if (Array.isArray(perm)) {
      return perm.some(p => userPerms.includes(p));
    }
    return userPerms.includes(perm);
  }

  const value: AuthContextValue = {
    user,
    accessToken,
    permissions,
    login,
    verify,
    register,
    logout,
    refresh,
    refreshUser: refresh,
    hasPermission,
    initializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

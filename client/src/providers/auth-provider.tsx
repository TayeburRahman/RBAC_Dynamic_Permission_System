"use client";

import React from "react";
import api, { setAccessToken } from "@/lib/api";
import { useAppDispatch } from '@/store/store';
import { setUser as setUserAction, setAccessToken as setAccessTokenAction, clearAuth } from '@/store/authSlice';

type User = any;

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  permissions: string[];
  login: (email: string, password: string) => Promise<void>;
  verify: (payload: any) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
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
      }
      setInitializing(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAuthData(at: string | null, u: any, perms: string[]) {
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
      const { accessToken: at, user: u, permissions: perms } = res.data.data || {};
      applyAuthData(at, u, perms);
    } catch (err: any) {
      throw err;
    }
  }

  async function verify(payload: any) {
    try {
      const res = await api.post('/auth/verify-otp', payload);
      const { accessToken: at, user: u, permissions: perms } = res.data.data || {};
      applyAuthData(at, u, perms);
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
    setAccessToken(null);
    setToken(null);
    setUser(null);
    setPermissions([]);
    dispatch(clearAuth());
  }

  async function refresh() {
    try {
      const res = await api.post('/auth/refresh');
      const { accessToken: at, user: u, permissions: perms } = res.data.data || {};
      if (at) {
        applyAuthData(at, u, perms);
      }
    } catch (err) {
      setAccessToken(null);
      setToken(null);
      setUser(null);
      setPermissions([]);
      throw err;
    }
  }

  function hasPermission(perm: string): boolean {
    if (user?.role === 'SUPER_ADMIN') return true;
    return (permissions || []).includes(perm);
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

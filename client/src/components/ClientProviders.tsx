"use client";

import React from "react";
import NextTopLoader from 'nextjs-toploader';
import { ThemeProvider } from '@/providers/theme-provider';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from '@/providers/auth-provider';
import { SocketProvider } from '@/providers/socket-provider';
import { Toaster } from "@/components/ui/sonner";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextTopLoader color="var(--primary)" showSpinner={false} />
      <Provider store={store}>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </Provider>
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}

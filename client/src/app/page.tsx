"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";

export default function RootPage() {
  const router = useRouter();
  const auth = useAuthContext();
  React.useEffect(() => {
    if (!auth) return;

    // Wait for provider to finish silent refresh
    if (auth.initializing) return;

    // If not authenticated, go to login
    if (!auth.user) {
      router.replace('/auth/login');
      return;
    }

    // Role-based redirect: customers go to profile, others to dashboard
    const role = (auth.user as any)?.role;
    if (role === 'CUSTOMER') {
      router.replace('/profile');
    } else {
      router.replace('/dashboard');
    }
  }, [auth, router]);

  if (!auth || auth.initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return null;
}

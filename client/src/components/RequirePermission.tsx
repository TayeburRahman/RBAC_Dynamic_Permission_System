"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

type Props = {
  permission: string;
  children: React.ReactNode;
};

export default function RequirePermission({ permission, children }: Props) {
  const auth = useAuthContext();
  const router = useRouter();

  React.useEffect(() => {
    if (!auth || auth.initializing) return;
    if (!auth.user) {
      router.push('/auth/login');
      return;
    }
    if (!auth.hasPermission(permission)) {
      router.push('/403');
    }
  }, [auth, permission, router]);

  // Show loading spinner while auth initializes to prevent flash redirects
  if (!auth || auth.initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not permitted, don't render children (redirect is happening)
  if (!auth.user || !auth.hasPermission(permission)) {
    return null;
  }

  return <>{children}</>;
}

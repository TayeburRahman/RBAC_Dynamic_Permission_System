"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full bg-card p-8 rounded-2xl border shadow-xl text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <ShieldAlert className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Access Denied</h1>
          <p className="text-muted-foreground">
            We're sorry, but you don't have the required security permissions to view this content.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border text-sm text-left">
          <p className="font-semibold mb-1">Why am I seeing this?</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Your role/permissions were recently updated</li>
            <li>You're trying to access a restricted administrative area</li>
            <li>The session may have expired and requires re-login</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1 gap-2" variant="default">
            <Link href="/dashboard">
              <Home className="h-4 w-4" /> Go to Dashboard
            </Link>
          </Button>
          <Button asChild className="flex-1 gap-2" variant="outline" onClick={() => window.history.back()}>
            <span>
              <ArrowLeft className="h-4 w-4" /> Go Back
            </span>
          </Button>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-muted-foreground italic">
        RBAC Dynamic Permission System &copy; 2024 Secure Flow
      </p>
    </div>
  );
}

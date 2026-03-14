"use client";

import React from "react";
import RequirePermission from "@/components/RequirePermission";

export default function ProfilePage() {
  return (
    <RequirePermission permission="view_profile">
      <div className="p-6">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">View and edit your profile.</p>
      </div>
    </RequirePermission>
  );
}

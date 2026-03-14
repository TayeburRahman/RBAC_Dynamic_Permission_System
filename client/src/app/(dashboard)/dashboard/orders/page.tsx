"use client";

import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";

export default function OrdersPage() {
  return (
    <RequirePermission permission="view_orders">
      <DashboardPageLayout>
        <DashboardHeader
          title="Orders"
          description="View and manage customer orders."
        />
        {/* Orders content goes here */}
      </DashboardPageLayout>
    </RequirePermission>
  );
}

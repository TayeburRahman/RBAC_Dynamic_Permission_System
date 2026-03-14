
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";

export default function OrdersPage() {
  return (
    <DashboardPageLayout>
      <DashboardHeader
        title="Orders"
        description="Manage your orders."
      />
    </DashboardPageLayout>
  );
}

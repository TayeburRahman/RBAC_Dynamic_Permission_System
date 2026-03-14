import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";

export default function AnalyticsPage() {
  return (
    <DashboardPageLayout>
      <DashboardHeader
        title="Analytics"
        description="View your business performance insights."
      />
    </DashboardPageLayout>
  );
}
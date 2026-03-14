import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";

export default function SettingsPage() {
  return (
    <DashboardPageLayout>
      <DashboardHeader
        title="Settings"
        description="Manage your account and application settings."
      />
    </DashboardPageLayout>
  );
}
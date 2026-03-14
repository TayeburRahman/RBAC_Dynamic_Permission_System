"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Target, 
  CheckSquare, 
  ShieldCheck, 
  Ban, 
  UserCheck, 
  MessageSquare, 
  ShoppingBag,
  Bell,
  Clock,
  ArrowRight
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/providers/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const auth = useAuthContext();
  const isCustomer = auth?.user?.role?.toUpperCase() === 'CUSTOMER';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (isCustomer) {
          const [tRes, oRes] = await Promise.all([
            api.get("/tickets/my-stats"),
            api.get("/orders/my-stats"),
          ]);
          setStats({
            tickets: tRes.data.data,
            orders: oRes.data.data
          });
        } else {
          const [uRes, tRes, tkRes, oRes] = await Promise.all([
            api.get("/users/stats"),
            api.get("/tasks/stats"),
            api.get("/tickets/stats"),
            api.get("/orders/stats"),
          ]);
          setStats({
            users: uRes.data.data,
            tasks: tRes.data.data,
            tickets: tkRes.data.data,
            orders: oRes.data.data
          });
        }
      } catch (err) {
        // toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isCustomer]);

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <Card className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 duration-300 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {loading ? <Skeleton className="h-8 w-16" /> : value ?? 0}
        </div>
        {subText && (
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3" /> {subText}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <RequirePermission permission="view_dashboard">
      <DashboardPageLayout>
        <DashboardHeader
          title={isCustomer ? "Customer Portal" : "Admin Overview"}
          description={isCustomer 
            ? `Welcome back, ${auth?.user?.name || 'User'}! Track your support and orders here.` 
            : "Monitor system performance, user activity, and business metrics."
          }
        />

        {isCustomer ? (
          <div className="grid gap-6 mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Active Tickets"
                value={stats?.tickets?.open + stats?.tickets?.pending}
                icon={MessageSquare}
                color="bg-blue-500/10 text-blue-600"
                subText="Requires attention"
              />
              <StatCard
                title="Pending Orders"
                value={stats?.orders?.pending}
                icon={ShoppingBag}
                color="bg-amber-500/10 text-amber-600"
                subText="Processing"
              />
              <StatCard
                title="Paid Orders"
                value={stats?.orders?.paid}
                icon={UserCheck}
                color="bg-emerald-500/10 text-emerald-600"
                subText="Ready to ship"
              />
              <StatCard
                title="Closed Tickets"
                value={stats?.tickets?.closed}
                icon={CheckSquare}
                color="bg-gray-500/10 text-gray-500"
                subText="History"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-sm">Support Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button variant="outline" className="w-full justify-between group" asChild>
                    <Link href="/tickets">
                      Recent Tickets <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  {auth?.hasPermission(['view_orders', 'order.view.own']) && (
                    <Button variant="outline" className="w-full justify-between group" asChild>
                      <Link href="/orders">
                        Order History <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 mt-8">
            {/* Row 1: Users & System */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">System & Users</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Staff"
                  value={(stats?.users?.total || 0) - (stats?.users?.customers || 0)}
                  icon={Users}
                  color="bg-blue-500/10 text-blue-600"
                  subText="Internal users"
                />
                <StatCard
                  title="Active Customers"
                  value={stats?.users?.customers}
                  icon={UserCheck}
                  color="bg-green-500/10 text-green-600"
                  subText="External portal users"
                />
                <StatCard
                  title="Suspended"
                  value={stats?.users?.blocked}
                  icon={Ban}
                  color="bg-red-500/10 text-red-600"
                  subText="Access restricted"
                />
                <StatCard
                  title="Super Admins"
                  value={stats?.users?.admins}
                  icon={ShieldCheck}
                  color="bg-purple-500/10 text-purple-600"
                  subText="Root access"
                />
              </div>
            </div>

            {/* Row 2: Business Operations */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">Operations</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Open Tasks"
                  value={(stats?.tasks?.todo || 0) + (stats?.tasks?.inProgress || 0)}
                  icon={CheckSquare}
                  color="bg-orange-500/10 text-orange-600"
                  subText="In progress"
                />
                <StatCard
                  title="Support Load"
                  value={stats?.tickets?.open}
                  icon={MessageSquare}
                  color="bg-cyan-500/10 text-cyan-600"
                  subText="New tickets"
                />
                <StatCard
                  title="Sales Orders"
                  value={stats?.orders?.total}
                  icon={ShoppingBag}
                  color="bg-pink-500/10 text-pink-600"
                  subText="Lifetime count"
                />
                <StatCard
                  title="Completed Tasks"
                  value={stats?.tasks?.done}
                  icon={UserCheck}
                  color="bg-emerald-500/10 text-emerald-600"
                  subText="Closed items"
                />
              </div>
            </div>
          </div>
        )}
      </DashboardPageLayout>
    </RequirePermission>
  );
}
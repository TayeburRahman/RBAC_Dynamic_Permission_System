"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  MessageSquare, 
  ShoppingBag, 
  User, 
  Settings, 
  ArrowRight, 
  Clock, 
  AlertCircle,
  FileText,
  History
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/auth-provider";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function CustomerPortalPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useAuthContext();

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.get("/tickets/my-stats"),
          api.get("/tickets/my-tickets?limit=3")
        ]);
        setStats(statsRes.data.data);
        setRecentTickets(ticketsRes.data.data.tickets || []);
      } catch (err) {
        console.error("Failed to load portal data");
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, []);

  const QuickAction = ({ title, desc, icon: Icon, href, color }: any) => (
    <Link href={href}>
      <Card className="hover:border-primary/50 transition-all group overflow-hidden border-none shadow-sm cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
          <div className={cn("p-2 rounded-lg transition-colors", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-bold group-hover:text-primary transition-colors">{title}</CardTitle>
            <CardDescription className="text-xs truncate">{desc}</CardDescription>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </CardHeader>
      </Card>
    </Link>
  );

  return (
    <RequirePermission permission="view_dashboard">
      <DashboardPageLayout>
        <DashboardHeader
          title="Customer Portal"
          description={`Welcome back, ${auth?.user?.name || 'Customer'}! How can we help you today?`}
        />

        <div className="grid gap-6 mt-8">
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <QuickAction 
              title="New Support Ticket" 
              desc="Get help from our experts" 
              icon={MessageSquare} 
              href="/tickets" 
              color="bg-blue-500/10 text-blue-600"
            />
            {auth?.hasPermission('view_orders') && (
              <QuickAction 
                title="Track Orders" 
                desc="View your purchase history" 
                icon={ShoppingBag} 
                href="/orders" 
                color="bg-emerald-500/10 text-emerald-600"
              />
            )}
            <QuickAction 
              title="Account Settings" 
              desc="Update your preferences" 
              icon={User} 
              href="/profile" 
              color="bg-purple-500/10 text-purple-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Stats Summary */}
            <Card className="lg:col-span-1 border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Support Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Open Tickets</span>
                  </div>
                  <span className="text-lg font-bold">{loading ? <Skeleton className="h-6 w-6" /> : stats?.open || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium">Pending Response</span>
                  </div>
                  <span className="text-lg font-bold">{loading ? <Skeleton className="h-6 w-6" /> : stats?.pending || 0}</span>
                </div>
                <Button className="w-full mt-2" variant="ghost" asChild>
                  <Link href="/tickets">View Full History</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Tickets */}
            <Card className="lg:col-span-2 border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Recent Interactions</CardTitle>
                    <CardDescription className="text-xs">Your last 3 support requests</CardDescription>
                  </div>
                  <History className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))
                  ) : recentTickets.length > 0 ? (
                    recentTickets.map((ticket) => (
                      <Link key={ticket._id} href={`/tickets`} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-primary/20 hover:bg-accent/30 transition-all group">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{ticket.title}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          ticket.status === 'open' ? "bg-blue-500/10 text-blue-600" :
                          ticket.status === 'pending' ? "bg-amber-500/10 text-amber-600" :
                          "bg-gray-500/10 text-gray-600"
                        )}>
                          {ticket.status}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground italic">No recent support requests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Interaction Log Placeholder */}
          <Card className="border-none shadow-sm">
             <CardHeader className="pb-3 text-center">
                <div className="inline-flex p-3 rounded-full bg-primary/5 text-primary mx-auto mb-2">
                   <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">Need Further Assistance?</CardTitle>
                <CardDescription>Our team is available 24/7 to help you with any issues.</CardDescription>
             </CardHeader>
             <CardContent className="flex justify-center pb-6">
                <Button variant="outline" className="gap-2">
                   Contact Support Now
                </Button>
             </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    </RequirePermission>
  );
}

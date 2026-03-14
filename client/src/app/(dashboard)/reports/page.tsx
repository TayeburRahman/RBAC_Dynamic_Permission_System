"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { 
  Users, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  Download, 
  Calendar,
  Layers,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for charts - in a real app, these would come from the API
  const userGrowthData = [
    { name: 'Jan', users: 400 },
    { name: 'Feb', users: 700 },
    { name: 'Mar', users: 1200 },
    { name: 'Apr', users: 1900 },
    { name: 'May', users: 2400 },
    { name: 'Jun', users: 3100 },
  ];

  const leadDistribution = [
    { name: 'New', value: 400 },
    { name: 'Contacted', value: 300 },
    { name: 'Qualified', value: 300 },
    { name: 'Lost', value: 200 },
  ];

  const taskVelocity = [
    { day: 'Mon', completed: 12 },
    { day: 'Tue', completed: 19 },
    { day: 'Wed', completed: 15 },
    { day: 'Thu', completed: 22 },
    { day: 'Fri', completed: 30 },
    { day: 'Sat', completed: 10 },
    { day: 'Sun', completed: 8 },
  ];

  const handleExport = (format: 'csv' | 'pdf') => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/exports/leads?format=${format}`, '_blank');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, tRes] = await Promise.all([
          api.get("/users/stats"),
          api.get("/tasks/stats"),
        ]);
        setStats(uRes.data.data);
        setTaskStats(tRes.data.data);
      } catch (err) {
        // toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <RequirePermission permission="view_reports">
      <DashboardPageLayout>
        <DashboardHeader
          title="Analytics & Reports"
          description="Get deep insights into system usage, user activity, and task efficiency."
        >
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 shrink-0 h-9">
              <Calendar className="h-4 w-4" />
              Last 30 Days
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="gap-2 shadow-sm shrink-0 h-9">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>Export CSV (Leads)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>Export PDF (Leads)</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/exports/users?format=pdf`, '_blank')}>Export PDF (Users)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DashboardHeader>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-8">
          <Card className="shadow-sm border-none bg-gradient-to-br from-blue-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? <Skeleton className="h-10 w-20" /> : stats?.total}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="h-3 w-3" /> +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gradient-to-br from-emerald-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Support Load
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? <Skeleton className="h-10 w-20" /> : "24"}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-emerald-600 font-medium">
                <TrendingUp className="h-3 w-3" /> New inquiries today
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gradient-to-br from-orange-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckSquare className="h-3.5 w-3.5" /> Task Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? <Skeleton className="h-10 w-20" /> : taskStats?.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Total items in pipeline</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-none bg-gradient-to-br from-purple-500/10 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? <Skeleton className="h-10 w-20" /> : "12"}</div>
              <p className="text-xs text-muted-foreground mt-1">Requiring fulfillment</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base">User Growth Overview</CardTitle>
              <CardDescription>New registered accounts per month</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: 'currentColor', opacity: 0.5}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: 'currentColor', opacity: 0.5}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base">Lead Pipeline Distribution</CardTitle>
              <CardDescription>Current status breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadDistribution}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 pr-8">
                {leadDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm h-full md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Task Completion Velocity</CardTitle>
              <CardDescription>Weekly productivity metrics</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskVelocity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tick={{fill: 'currentColor', opacity: 0.5}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{fill: 'currentColor', opacity: 0.5}} />
                  <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </DashboardPageLayout>
    </RequirePermission>
  );
}

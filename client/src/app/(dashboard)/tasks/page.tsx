"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreVertical, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CustomPagination from "@/components/ui/custom/custom-pagination";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks?page=${page}&search=${search}`);
      setTasks(res.data.data.tasks);
      setMeta(res.data.data.meta);
    } catch (err) {
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive" className="px-2 py-0">High</Badge>;
      case 'medium': return <Badge className="bg-orange-500 text-white border-none px-2 py-0">Medium</Badge>;
      case 'low': return <Badge variant="secondary" className="px-2 py-0">Low</Badge>;
      default: return null;
    }
  };

  return (
    <RequirePermission permission="manage_tasks">
      <DashboardPageLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <DashboardHeader
            title="Tasks Management"
            description="Assign, track and manage team tasks and priorities."
          />
          <Button className="w-full md:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[350px]">Task Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-[280px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>Great job! No pending tasks found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{task.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 capitalize text-sm">
                        {getStatusIcon(task.status)}
                        {task.status.replace('-', ' ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(task.priority)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.assignedTo?.name || "Unassigned"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.dueDate ? (
                        <span className={cn(
                          "flex items-center gap-1",
                          new Date(task.dueDate) < new Date() && task.status !== 'done' ? "text-destructive font-medium" : "text-muted-foreground"
                        )}>
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="mt-6 flex justify-end">
            <CustomPagination
              currentPage={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </DashboardPageLayout>
    </RequirePermission>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

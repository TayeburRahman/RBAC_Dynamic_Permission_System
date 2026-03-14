"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Search, History, Shield, User, Activity } from "lucide-react";
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

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/audit-logs?page=${page}&action=${search}`);
      setLogs(res.data.data.logs);
      setMeta(res.data.data.meta);
    } catch (err) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search]);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none">Create</Badge>;
    if (action.includes('UPDATE')) return <Badge className="bg-blue-500 hover:bg-blue-600 border-none">Update</Badge>;
    if (action.includes('DELETE')) return <Badge variant="destructive">Delete</Badge>;
    if (action.includes('SUSPEND') || action.includes('BAN')) return <Badge variant="destructive" className="bg-red-600">Admin Action</Badge>;
    return <Badge variant="outline">{action}</Badge>;
  };

  return (
    <RequirePermission permission="view_audit_logs">
      <DashboardPageLayout>
        <DashboardHeader
          title="Audit Activity Log"
          description="A complete record of all administrative actions and system updates."
        />

        <div className="flex items-center gap-3 mt-8 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by action (e.g. CREATE_USER)..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p>The system is calm. No activity logs found.</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} className="text-sm font-normal">
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          <User className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-xs">{log.actorName || log.actor?.name || 'System'}</span>
                          <span className="text-[10px] text-muted-foreground">{log.actor?.role}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getActionBadge(log.action)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">{log.target}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{log.targetId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {log.metadata ? (
                        <pre className="text-[10px] bg-muted p-1.5 rounded-md overflow-x-auto text-muted-foreground">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      ) : "-"}
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

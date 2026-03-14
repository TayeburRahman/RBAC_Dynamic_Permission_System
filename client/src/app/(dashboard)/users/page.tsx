"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Shield, Ban, UserCheck, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import CustomPagination from "@/components/ui/custom/custom-pagination";
import PermissionEditor from "@/components/ui/custom/permission-editor";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Permission Editor State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&search=${search}`);
      setUsers(res.data.data.users);
      setMeta(res.data.data.meta);
    } catch (err) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSuspend = async (id: string, currentlyBlocked: boolean) => {
    try {
      const endpoint = currentlyBlocked ? `/users/${id}/unsuspend` : `/users/${id}/suspend`;
      await api.patch(endpoint);
      toast.success(currentlyBlocked ? "User unsuspended" : "User suspended");
      fetchUsers();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <RequirePermission permission="manage_users">
      <DashboardPageLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <DashboardHeader
            title="User Management"
            description="Manage system users, roles, and security permissions."
          />
          <Button className="w-full md:w-auto gap-2">
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-6 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal capitalize">
                        {user.role.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_block ? (
                        <Badge variant="destructive" className="gap-1 px-2">
                          <Ban className="h-3 w-3" /> Blocked
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1 px-2 text-white border-none">
                          <UserCheck className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => {
                              setSelectedUserId(user._id);
                              setSelectedUserName(user.name);
                            }}
                          >
                            <Shield className="h-4 w-4" /> Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={cn("gap-2", user.is_block ? "text-emerald-600" : "text-destructive")}
                            onClick={() => handleSuspend(user._id, user.is_block)}
                          >
                            {user.is_block ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            {user.is_block ? "Unsuspend User" : "Suspend User"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

        {/* Permission Editor Sheet */}
        <PermissionEditor
          userId={selectedUserId}
          userName={selectedUserName}
          onClose={() => {
            setSelectedUserId(null);
            setSelectedUserName(null);
          }}
        />
      </DashboardPageLayout>
    </RequirePermission>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

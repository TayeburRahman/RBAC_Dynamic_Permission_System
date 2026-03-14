"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/providers/auth-provider";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Plus, Search, Shield, Ban, UserCheck, MoreVertical, CheckSquare, Trash2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function UsersPage() {
  const auth = useAuthContext();
  const currentRole = auth?.user?.role as string | undefined;

  // Only SUPER_ADMIN, ADMIN and MANAGER can access this page
  const canAccess = currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN' || currentRole === 'MANAGER';

  // Role options based on current user's role
  const roleOptions =
    currentRole === 'SUPER_ADMIN'
      ? [
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
        { value: 'MANAGER', label: 'Manager' },
        { value: 'AGENT', label: 'Agent (Staff)' },
        { value: 'CUSTOMER', label: 'Customer (Self-service)' },
      ]
      : [
        { value: 'AGENT', label: 'Agent (Staff)' },
        { value: 'CUSTOMER', label: 'Customer (Self-service)' },
      ];

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Permission Editor State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

  // Create User State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    role: "CUSTOMER",
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map(u => u._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status: 'suspend' | 'unsuspend') => {
    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map(id => api.patch(`/users/${id}/${status}`)));
      toast.success(`Bulk ${status} completed`);
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      toast.error("Bulk action failed");
    } finally {
      setBulkLoading(false);
    }
  };


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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post("/users", newUser);
      toast.success("User created successfully");
      setIsCreateModalOpen(false);
      setNewUser({ name: "", email: "", phone_number: "", password: "", role: "CUSTOMER" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setCreateLoading(false);
    }
  };

  if (!auth?.initializing && !canAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <RequirePermission permission="manage_users">
      <DashboardPageLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <DashboardHeader
            title="User Management"
            description="Manage system users, roles, and security permissions."
          />
          <div className="flex items-center gap-2 w-full md:w-auto">

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 md:flex-none gap-2 h-10 shadow-sm bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateUser}>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>
                      Create a new account and assign a role to the user.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="017xxxxxxxx"
                        required
                        value={newUser.phone_number}
                        onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Initial Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">System Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(v) => setNewUser({ ...newUser, role: v })}
                      >
                        <SelectTrigger id="role" className="w-full h-10">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createLoading} className="w-full gap-2">
                      {createLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {createLoading ? "Creating..." : "Register User"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-10 h-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                {selectedIds.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-emerald-600"
                disabled={bulkLoading}
                onClick={() => handleBulkStatus('unsuspend')}
              >
                <UserCheck className="h-4 w-4" /> Unsuspend
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-destructive"
                disabled={bulkLoading}
                onClick={() => handleBulkStatus('suspend')}
              >
                <Ban className="h-4 w-4" /> Suspend
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={users.length > 0 && selectedIds.length === users.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
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
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id} className={cn("hover:bg-muted/30 transition-colors", selectedIds.includes(user._id) && "bg-muted/50")}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(user._id)}
                        onCheckedChange={() => toggleSelectOne(user._id)}
                      />
                    </TableCell>
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

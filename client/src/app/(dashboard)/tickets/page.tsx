"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MessageSquare,
  MoreVertical,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Send,
  Paperclip,
  X,
  FileText
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import CustomPagination from "@/components/ui/custom/custom-pagination";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "", priority: "medium" });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const auth = useAuthContext();
  const isCustomer = auth?.user?.role === 'CUSTOMER';

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isCustomer ? "/tickets/my-tickets" : "/tickets";
      const response = await api.get(endpoint, {
        params: {
          searchTerm: search,
          page,
          limit: 10,
          sort: "-updatedAt"
        }
      });

      if (response.data.success) {
        setTickets(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      // toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [search, page, isCustomer]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (attachments.length + selectedFiles.length > 5) {
        toast.error("Maximum 5 attachments allowed");
        return;
      }
      setAttachments([...attachments, ...selectedFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", newTicket.title);
      formData.append("description", newTicket.description);
      formData.append("priority", newTicket.priority);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await api.post("/tickets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success("Ticket created successfully");
        setIsCreateModalOpen(false);
        setNewTicket({ title: "", description: "", priority: "medium" });
        setAttachments([]);
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const response = await api.patch(`/tickets/${ticketId}/status`, { status: "closed" });
      if (response.data.success) {
        toast.success("Ticket resolved successfully");
        fetchTickets();
      }
    } catch (error: any) {
      console.error("Failed to resolve ticket:", error);
      toast.error(error.response?.data?.message || "Failed to resolve ticket");
    }
  };

  const handleClaimTicket = async (ticketId: string) => {
    try {
      const actor = auth?.user;
      const actorId = actor?.authId || actor?._id;
      
      const response = await api.patch(`/tickets/${ticketId}/assign`, { assignedTo: actorId });
      if (response.data.success) {
        toast.success("Ticket claimed successfully");
        fetchTickets();
      }
    } catch (error: any) {
      console.error("Failed to claim ticket:", error);
      toast.error(error.response?.data?.message || "Failed to claim ticket");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">Open</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/20">Pending</Badge>;
      case "closed":
        return <Badge variant="outline" className="text-muted-foreground opacity-70">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RequirePermission permission="view_tickets">
      <DashboardPageLayout>
        <DashboardHeader
          title="Support Center"
          description={isCustomer ? "Instant help and support for your services." : "Monitor and resolve customer support tickets."}
        >
          {auth?.hasPermission('create_tickets') && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary shadow-lg hover:shadow-primary/20 transition-all">
                  <Plus className="h-4 w-4" /> New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <form onSubmit={handleCreateTicket}>
                  <DialogHeader>
                    <DialogTitle>Raise Support Ticket</DialogTitle>
                    <DialogDescription>
                      Describe your issue. You can attach up to 5 screenshots or documents.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-5 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="font-semibold">Support Topic</Label>
                      <Input
                        id="title"
                        placeholder="e.g. Can't access my dashboard"
                        required
                        value={newTicket.title}
                        className="h-11"
                        onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="font-semibold">Urgency</Label>
                        <select
                          id="priority"
                          className="w-full h-11 px-3 py-2 rounded-xl border border-input bg-background text-sm shadow-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          value={newTicket.priority}
                          onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                        >
                          <option value="low">Low - General Question</option>
                          <option value="medium">Medium - Technical Bug</option>
                          <option value="high">High - Mission Critical</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold">Attachments</Label>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-11 gap-2 border-dashed"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4" /> Add Files
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>

                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/30 border border-dashed">
                        {attachments.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border text-xs font-medium shadow-sm">
                            <FileText className="h-3 w-3 text-primary" />
                            <span className="max-w-[100px] truncate">{file.name}</span>
                            <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="description" className="font-semibold">Message Detail</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide steps to reproduce or account details..."
                        rows={5}
                        required
                        className="resize-none rounded-xl"
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Discard</Button>
                    <Button type="submit" disabled={submitting} className="min-w-[140px] shadow-md">
                      {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {submitting ? "Sending..." : "Create Ticket"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </DashboardHeader>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by topic, ID, or customer..."
              className="pl-10 h-11 rounded-xl shadow-sm border-muted-foreground/10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-4 pl-6 font-bold text-foreground">Status</TableHead>
                <TableHead className="font-bold text-foreground">Ticket Details</TableHead>
                {!isCustomer && <TableHead className="font-bold text-foreground tracking-tight">Client</TableHead>}
                <TableHead className="font-bold text-foreground text-center">Urgency</TableHead>
                <TableHead className="font-bold text-foreground">Asignee</TableHead>
                <TableHead className="font-bold text-foreground text-right pr-6 tracking-tight">Updated</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={isCustomer ? 6 : 7} className="p-4">
                      <Skeleton className="h-12 w-full rounded-xl" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCustomer ? 6 : 7} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground animate-in fade-in zoom-in duration-500">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="h-8 w-8 opacity-40" />
                      </div>
                      <p className="text-lg font-bold">No active tickets</p>
                      <p className="text-sm">Great! No pending issues at the moment.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket._id} className="group hover:bg-primary/[0.02] transition-colors border-b last:border-0">
                    <TableCell className="pl-6">{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground text-sm leading-none">{ticket.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1.5 py-0.5 rounded bg-muted/50 w-fit">
                            ID {ticket._id.slice(-6).toUpperCase()}
                          </span>
                          {ticket.attachments?.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-primary font-bold">
                              <Paperclip className="h-3 w-3" /> {ticket.attachments.length}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!isCustomer && (
                      <TableCell>
                        <div className="flex items-center gap-3 font-medium">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[11px] font-black text-primary border border-primary/10">
                            {ticket.customerId?.name?.charAt(0) || "C"}
                          </div>
                          <span className="text-sm truncate max-w-[140px]">{ticket.customerId?.name || "Anonymous"}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn(
                        "text-[10px] px-2 py-0.5 uppercase tracking-tighter font-black border-2",
                        ticket.priority === 'high' ? "text-destructive border-destructive/10 bg-destructive/5" :
                          ticket.priority === 'medium' ? "text-amber-600 border-amber-500/10 bg-amber-500/5" :
                            "text-emerald-600 border-emerald-500/10 bg-emerald-500/5"
                      )}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {ticket.assignedTo ? (
                          <>
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              <UserIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground/80">{ticket.assignedTo.name}</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-muted-foreground/40 italic">Waiting...</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-foreground/70">
                          {new Date(ticket.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase font-black">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(ticket.updatedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl">
                          <DropdownMenuLabel className="text-xs font-bold text-muted-foreground ml-1">TICKET HUB</DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem className="gap-3 h-10 px-3 cursor-pointer rounded-lg focus:bg-primary/5">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">Open Workspace</span>
                              <span className="text-[10px] text-muted-foreground">Chat with support team</span>
                            </div>
                          </DropdownMenuItem>
                          {auth?.hasPermission('manage_tickets') && (
                            <>
                              <DropdownMenuSeparator className="my-1" />
                              <DropdownMenuItem 
                                className="gap-3 h-10 px-3 cursor-pointer rounded-lg text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                                onClick={() => handleResolveTicket(ticket._id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="font-bold text-sm">Resolve Ticket</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-3 h-10 px-3 cursor-pointer rounded-lg focus:bg-primary/5"
                                onClick={() => handleClaimTicket(ticket._id)}
                              >
                                <UserIcon className="h-4 w-4" />
                                <span className="font-bold text-sm">Claim Ownership</span>
                              </DropdownMenuItem>
                            </>
                          )}
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
          <div className="mt-8 flex justify-end">
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

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", props.className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

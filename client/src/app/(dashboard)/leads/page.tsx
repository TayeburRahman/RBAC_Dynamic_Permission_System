"use client";

import { useEffect, useState } from "react";
import RequirePermission from "@/components/RequirePermission";
import DashboardHeader from "@/components/ui/custom/dashboard-header";
import DashboardPageLayout from "@/components/ui/custom/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  Briefcase, 
  Calendar, 
  UserPlus, 
  Mail, 
  Phone, 
  Zap, 
  Loader2,
  MoreVertical
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form state
  const [newLead, setNewLead] = useState({
    title: "",
    name: "",
    email: "",
    phone_number: "",
    description: "",
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leads?page=${page}&search=${search}`);
      setLeads(res.data.data.leads);
      setMeta(res.data.data.meta);
    } catch (err) {
      // toast.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingId("creating");
    try {
      await api.post("/leads", newLead);
      toast.success("Lead created successfully");
      setIsCreateModalOpen(false);
      setNewLead({ title: "", name: "", email: "", phone_number: "", description: "" });
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create lead");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConvertToOrder = async (id: string) => {
    setProcessingId(id);
    try {
      await api.post(`/leads/${id}/convert`);
      toast.success("Lead converted to customer & order created!");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to convert lead");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'in-progress': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'converted': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'closed': return 'bg-gray-500/10 text-gray-600 border-gray-200';
      case 'lost': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <RequirePermission permission="manage_leads">
      <DashboardPageLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <DashboardHeader
            title="Leads & Pipeline"
            description="Manage inbound inquiries and convert them into paid customers."
          />
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto gap-2 shadow-sm bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4" /> New Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handleCreateLead}>
                <DialogHeader>
                  <DialogTitle>Capture New Lead</DialogTitle>
                  <DialogDescription>
                    Enter the lead's contact details and interest to start the pipeline.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Interest / Product</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Enterprise License" 
                      required 
                      value={newLead.title}
                      onChange={(e) => setNewLead({...newLead, title: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Contact Name</Label>
                      <Input 
                        id="name" 
                        required 
                        value={newLead.name}
                        onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        required 
                        value={newLead.phone_number}
                        onChange={(e) => setNewLead({...newLead, phone_number: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="desc">Additional Requirements</Label>
                    <Textarea 
                      id="desc" 
                      rows={3} 
                      value={newLead.description}
                      onChange={(e) => setNewLead({...newLead, description: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={processingId === "creating"} className="w-full gap-2">
                    {processingId === "creating" && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Lead Entry
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name or product..."
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="py-4">Lead Detail</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Agent</TableHead>
                <TableHead className="text-right pr-6">Conversion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-[180px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[120px]" /></TableCell>
                    <TableCell className="text-right pr-6"><Skeleton className="h-9 w-[100px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-medium">Pipeline is empty</p>
                    <p className="text-sm">New inquiries will appear here automatically.</p>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead._id} className="hover:bg-muted/20 transition-all">
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground">{lead.title}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> 
                          Created {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{lead.name}</span>
                        <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone_number}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("capitalize px-2.5 py-0.5 font-bold shadow-sm", getStatusColor(lead.status))}>
                        {lead.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/5 flex items-center justify-center">
                          <UserPlus className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          {lead.assignedTo?.name || "Unassigned"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {lead.status === 'converted' ? (
                        <Button variant="ghost" className="text-emerald-600 gap-2 font-bold text-xs pointer-events-none">
                          <Zap className="h-3 w-3 fill-emerald-600" /> Converted
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => handleConvertToOrder(lead._id)}
                          disabled={processingId === lead._id}
                          className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                        >
                          {processingId === lead._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                          Convert
                        </Button>
                      )}
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

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

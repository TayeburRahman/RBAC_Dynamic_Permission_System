"use client";

import { useState, useEffect, useCallback } from "react";
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
  ShoppingBag, 
  MoreVertical, 
  Package, 
  Truck, 
  CheckCircle2, 
  CreditCard,
  User as UserIcon,
  ArrowRight
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import CustomPagination from "@/components/ui/custom/custom-pagination";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  
  const auth = useAuthContext();
  const isCustomer = auth?.user?.role === 'CUSTOMER';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isCustomer ? "/orders/my-orders" : "/orders";
      const response = await api.get(endpoint, {
        params: {
          searchTerm: search,
          page,
          limit: 10,
          sort: "-createdAt"
        }
      });
      
      if (response.data.success) {
        setOrders(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, page, isCustomer]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50">Pending</Badge>;
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50">Paid</Badge>;
      case "delivered":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="opacity-70">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RequirePermission permission="view_orders">
      <DashboardPageLayout>
        <DashboardHeader
          title="Orders & Transactions"
          description={isCustomer ? "View your order history and tracking info." : "Manage customer orders and payment statuses."}
        />

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by ID..."
              className="pl-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                {!isCustomer && <TableHead className="font-semibold">Customer</TableHead>}
                <TableHead className="font-semibold">Items</TableHead>
                <TableHead className="font-semibold text-right">Amount</TableHead>
                <TableHead className="font-semibold text-right">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell colSpan={isCustomer ? 5 : 6}>
                      <div className="h-10 bg-muted/50 rounded-lg w-full"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isCustomer ? 5 : 6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <ShoppingBag className="h-8 w-8 opacity-20" />
                      <p>No orders found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order._id} className="group hover:bg-muted/30 transition-colors text-sm">
                    <TableCell className="font-mono font-medium tracking-tight text-primary">
                      {order.orderId}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(order.status)}</TableCell>
                    {!isCustomer && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-3 w-3 text-muted-foreground" />
                          <span>{order.customerId?.name || "Guest"}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="truncate max-w-[200px]">
                          {order.items.map((it: any) => `${it.quantity}x ${it.name}`).join(", ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{order.items.length} items total</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      ${order.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Order Management</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2">
                             <Package className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {auth?.hasPermission('manage_orders') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2">
                                <Truck className="h-4 w-4" /> Mark Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Mark Delivered
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

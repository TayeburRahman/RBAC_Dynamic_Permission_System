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
  Clock,
  CreditCard,
  User as UserIcon,
  ArrowRight
} from "lucide-react";
import { useAuthContext } from "@/providers/auth-provider";
import api from "@/lib/api";
import { toast } from "sonner";
import CustomPagination from "@/components/ui/custom/custom-pagination";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);

  const auth = useAuthContext();
  const isCustomer = auth?.user?.role?.toUpperCase() === 'CUSTOMER';
  const canViewAll = auth?.hasPermission('view_orders') && !isCustomer;

  const [newOrder, setNewOrder] = useState({
    customerId: "",
    items: [{ name: "", price: 0, quantity: 1 }],
    amount: 0
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = canViewAll ? "/orders" : "/orders/my-orders";
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

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/users?role=CUSTOMER&limit=100");
      setCustomers(res.data.data.users);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (!isCustomer && auth?.hasPermission('order.create')) {
      fetchCustomers();
    }
  }, [fetchOrders, isCustomer]);

  const handleAddItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: "", price: 0, quantity: 1 }]
    });
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate total amount
    const total = updatedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    setNewOrder({
      ...newOrder,
      items: updatedItems,
      amount: total
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCustomer && !newOrder.customerId) return toast.error("Please select a customer");
    if (newOrder.items.some(it => !it.name || it.price <= 0)) return toast.error("Please fill all item details correctly");

    setCreating(true);
    try {
      await api.post("/orders", newOrder);
      toast.success("Order created successfully");
      setIsModalOpen(false);
      setNewOrder({ customerId: "", items: [{ name: "", price: 0, quantity: 1 }], amount: 0 });
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create order");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200/50">Pending</Badge>;
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50">Paid</Badge>;
      case "shipped":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50">Shipped</Badge>;
      case "delivered":
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-200/50">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="opacity-70">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RequirePermission permission={["view_orders", "order.view.own"] as any}>
      <DashboardPageLayout>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <DashboardHeader
            title="Orders & Transactions"
            description={isCustomer ? "View your order history and tracking info." : "Manage customer orders and payment statuses."}
          />
          {auth?.hasPermission('order.create') && (
            <Button className="w-full md:w-auto gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" /> Create Order
            </Button>
          )}
        </div>

        {/* Create Order Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Order</DialogTitle>
              <DialogDescription>
                {isCustomer ? "Place a new order for yourself." : "Create an order on behalf of a customer."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateOrder}>
              <div className="grid gap-4 py-4">
                {!isCustomer && (
                  <div className="grid gap-2">
                    <Label>Select Customer</Label>
                    <Select value={newOrder.customerId} onValueChange={(val) => setNewOrder({ ...newOrder, customerId: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => (
                          <SelectItem key={c._id} value={c._id}>{c.name} ({c.email})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>Add Item</Button>
                  </div>
                  {newOrder.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 border p-3 rounded-lg relative group">
                      <div className="col-span-6 grid gap-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Item Name</Label>
                        <Input
                          className="h-8"
                          placeholder="Product Name"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-span-3 grid gap-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Price</Label>
                        <Input
                          className="h-8"
                          type="number"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) => handleUpdateItem(idx, 'price', Number(e.target.value))}
                        />
                      </div>
                      <div className="col-span-3 grid gap-1">
                        <Label className="text-[10px] uppercase text-muted-foreground">Qty</Label>
                        <Input
                          className="h-8"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <span className="font-semibold text-lg text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-2xl text-primary">${newOrder.amount.toFixed(2)}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Processing..." : "Create Order"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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
                          {auth?.hasPermission('manage_orders') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(order._id, 'pending')}>
                                <Clock className="h-4 w-4" /> Mark Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(order._id, 'paid')}>
                                <CreditCard className="h-4 w-4" /> Mark Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(order._id, 'shipped')}>
                                <Truck className="h-4 w-4" /> Mark Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(order._id, 'delivered')}>
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

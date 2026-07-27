import { useState } from "react";
import { Link, useParams } from "wouter";
import { useAuth } from "@/context/auth";
import { useGetOrder, useUpdateOrderStatus, OrderStatusUpdateStatus, getGetOrderQueryKey, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MapPin, Phone, User, Store, Calendar, CheckCircle2, Clock, Truck, Package, XCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const statusConfig: Record<string, { icon: any, color: string, bg: string, label: string, step: number }> = {
  pending: { icon: Clock, color: "text-amber-700", bg: "bg-amber-100", label: "Pending", step: 1 },
  confirmed: { icon: CheckCircle2, color: "text-blue-700", bg: "bg-blue-100", label: "Confirmed", step: 2 },
  processing: { icon: Package, color: "text-indigo-700", bg: "bg-indigo-100", label: "Processing", step: 3 },
  shipped: { icon: Truck, color: "text-purple-700", bg: "bg-purple-100", label: "Shipped", step: 4 },
  delivered: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100", label: "Delivered", step: 5 },
  cancelled: { icon: XCircle, color: "text-red-700", bg: "bg-red-100", label: "Cancelled", step: -1 },
};

export default function OrderDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id, {
    query: { queryKey: getGetOrderQueryKey(id), enabled: !!id && !!user }
  });

  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = (newStatus: OrderStatusUpdateStatus) => {
    updateStatusMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast({ title: "Order updated", description: `Status changed to ${statusConfig[newStatus].label}` });
          queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        },
        onError: () => {
          toast({ title: "Update failed", description: "Could not update order status.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Order not found</h2>
        <Button asChild><Link href="/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  const isSeller = user?.role === 'seller';
  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/orders"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Link>
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Order #{order.id}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy at h:mm a')}
          </p>
        </div>

        {isSeller && order.status !== 'delivered' && order.status !== 'cancelled' ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Update Status:</span>
            <Select 
              defaultValue={order.status} 
              onValueChange={(val) => handleStatusChange(val as OrderStatusUpdateStatus)}
              disabled={updateStatusMutation.isPending}
            >
              <SelectTrigger className="w-[160px] bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold ${currentStatus.bg} ${currentStatus.color}`}>
            <StatusIcon className="w-5 h-5" />
            {currentStatus.label}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order Items */}
          <Card className="rounded-2xl border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-lg font-serif">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-6 flex gap-4">
                    <Link href={`/products/${item.productId}`}>
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-muted border border-border overflow-hidden shrink-0">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted"></div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/products/${item.productId}`}>
                          <h3 className="font-serif font-bold text-lg leading-tight hover:text-primary transition-colors">{item.productTitle}</h3>
                        </Link>
                        <span className="font-bold text-primary">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <p>Price: ৳{item.price.toLocaleString()}</p>
                        <p className="font-medium text-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Address</p>
                  <p className="text-sm font-medium leading-relaxed">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Contact Phone</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {order.deliveryPhone}
                  </p>
                </div>
                {order.note && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Note</p>
                    <div className="bg-muted p-3 rounded-lg text-sm italic border border-border/50">
                      "{order.note}"
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> {isSeller ? "Customer" : "Store"} Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {isSeller ? <User className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    {isSeller ? order.buyerName : order.sellerName}
                  </p>
                </div>
                {!isSeller && (
                  <Button variant="outline" size="sm" asChild className="mt-2 rounded-full w-full">
                    <Link href={`/sellers/${order.sellerId}`}>Visit Store</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card className="rounded-2xl border-border/50">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
              <CardTitle className="text-lg font-serif">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items Subtotal</span>
                  <span className="font-medium">৳{(order.total - 60).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">৳60</span>
                </div>
              </div>
              
              <Separator className="mb-4" />
              
              <div className="flex justify-between items-end mb-6">
                <span className="font-serif font-bold">Total</span>
                <span className="font-serif text-3xl font-bold text-primary">৳{order.total.toLocaleString()}</span>
              </div>
              
              <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 border border-border/50">
                <div className="mt-0.5">
                  {order.paymentStatus === 'paid' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">Payment {order.paymentStatus === 'paid' ? 'Successful' : 'Pending'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 capitalize">Method: {order.paymentStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

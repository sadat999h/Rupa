import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { useGetOrders, OrderStatus, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
  pending: { icon: Clock, color: "text-amber-700", bg: "bg-amber-100", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "text-blue-700", bg: "bg-blue-100", label: "Confirmed" },
  processing: { icon: Package, color: "text-indigo-700", bg: "bg-indigo-100", label: "Processing" },
  shipped: { icon: Truck, color: "text-purple-700", bg: "bg-purple-100", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-100", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-red-700", bg: "bg-red-100", label: "Cancelled" },
};

export default function Orders() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: ordersData, isLoading } = useGetOrders({
    role: user?.role,
    status: statusFilter || undefined,
  }, {
    query: { queryKey: getGetOrdersQueryKey(), enabled: !!user }
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  const isSeller = user.role === 'seller';

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
            {isSeller ? "Store Orders" : "My Orders"}
          </h1>
          <p className="text-muted-foreground">
            {isSeller 
              ? "Manage orders from your customers" 
              : "Track and manage your purchases"}
          </p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button 
            variant={statusFilter === "" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setStatusFilter("")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "pending" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setStatusFilter("pending")}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === "processing" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setStatusFilter("processing")}
          >
            Processing
          </Button>
          <Button 
            variant={statusFilter === "delivered" ? "default" : "outline"} 
            className="rounded-full"
            onClick={() => setStatusFilter("delivered")}
          >
            Delivered
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))
        ) : ordersData?.length === 0 ? (
          <div className="py-20 text-center bg-card border border-border/50 rounded-3xl">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">You don't have any orders matching this filter.</p>
            {!isSeller && (
              <Button asChild className="rounded-full">
                <Link href="/products">Start Shopping</Link>
              </Button>
            )}
          </div>
        ) : (
          ordersData?.map((order) => {
            const statusStyle = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = statusStyle.icon;
            
            return (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow border-border/50 rounded-2xl">
                <CardContent className="p-0">
                  <div className="bg-muted/30 border-b border-border/50 p-4 md:p-6 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Order Placed</p>
                        <p className="font-medium text-foreground">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total</p>
                        <p className="font-medium text-foreground">৳{order.total.toLocaleString()}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                          {isSeller ? "Customer" : "Store"}
                        </p>
                        <p className="font-medium text-foreground">
                          {isSeller ? order.buyerName : order.sellerName}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="sm:hidden">
                        <p className="text-xs text-muted-foreground mb-1">Order #{order.id}</p>
                      </div>
                      <p className="hidden sm:block text-sm text-muted-foreground">Order #{order.id}</p>
                      
                      <Button variant="outline" asChild className="rounded-full shrink-0">
                        <Link href={`/orders/${order.id}`}>
                          View Details <ChevronRight className="ml-1 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 md:p-6 flex flex-col md:flex-row gap-6 justify-between md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusStyle.label}
                        </div>
                        {order.paymentStatus === 'paid' && (
                          <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">Paid</Badge>
                        )}
                        {order.paymentStatus === 'pending' && (
                          <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">Unpaid</Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted border border-border shrink-0">
                              {item.productImage ? (
                                <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-muted"></div>
                              )}
                            </div>
                            <div className="text-sm max-w-[120px]">
                              <p className="font-medium line-clamp-1" title={item.productTitle}>{item.productTitle}</p>
                              <p className="text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted border border-border text-sm font-medium text-muted-foreground">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isSeller && order.status === 'pending' && (
                      <div className="w-full md:w-auto flex flex-col gap-2 border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6">
                        <p className="text-sm font-medium text-center md:text-left mb-1">Action Required</p>
                        <Button asChild className="rounded-full w-full">
                          <Link href={`/orders/${order.id}`}>Process Order</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

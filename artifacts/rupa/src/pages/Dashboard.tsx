import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/auth";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package, Banknote, ShoppingBag, Clock, Plus, ArrowRight, Store } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (user.role !== 'seller') {
    setLocation("/");
    return null;
  }

  const { data: stats, isLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey(), enabled: !!user }
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" /> My Shop
          </h1>
          <p className="text-muted-foreground">Welcome back, {user.name}. Here's what's happening with your store.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/products">Manage Products</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/dashboard/add-product"><Plus className="w-4 h-4 mr-1" /> Add Product</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/add-recipe">Add Recipe</Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-1">৳{stats.totalRevenue.toLocaleString()}</h3>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Revenue</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-1">{stats.totalOrders}</h3>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-1">{stats.totalProducts}</h3>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Products</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold mb-1 text-amber-600">{stats.pendingOrders}</h3>
                  <p className="text-sm font-medium text-amber-700/80 uppercase tracking-wider">Orders to Process</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <Card className="lg:col-span-2 rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Revenue Overview</CardTitle>
                <CardDescription>Your shop's earning performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {stats.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `৳${val}`} />
                        <Tooltip 
                          cursor={{ fill: 'var(--muted)' }} 
                          contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                          formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
                      Not enough data yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="lg:col-span-1 rounded-2xl border-border/50 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-serif text-xl">Recent Orders</CardTitle>
                  <CardDescription>Latest customer purchases</CardDescription>
                </div>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                  <Link href="/orders"><ArrowRight className="w-4 h-4" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentOrders.slice(0, 5).map((order) => (
                      <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                        <div className="flex justify-between items-center p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                          <div>
                            <p className="font-bold text-sm mb-0.5 group-hover:text-primary transition-colors">{order.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'MMM dd')} • {order.items.length} items</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-foreground">৳{order.total.toLocaleString()}</p>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'pending' ? 'text-amber-600' :
                              order.status === 'delivered' ? 'text-emerald-600' : 'text-blue-600'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    No recent orders.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

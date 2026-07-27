import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCart, useCreateOrder, OrderInputPaymentMethod } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Truck, Banknote, CreditCard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth";

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(10, { message: "Please enter your full delivery address" }),
  deliveryPhone: z.string().min(11, { message: "Please enter a valid phone number" }),
  note: z.string().optional(),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'cod'] as const),
});

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: user?.location || "",
      deliveryPhone: user?.phone || "",
      note: "",
      paymentMethod: "cod",
    },
  });

  // If cart is empty and loaded, redirect
  if (!isCartLoading && (!cart || cart.items.length === 0)) {
    setLocation("/cart");
    return null;
  }

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    if (!cart) return;

    const orderInput = {
      items: cart.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      ...values,
    };

    createOrder.mutate({ data: orderInput }, {
      onSuccess: (order) => {
        toast({ title: "Order placed!", description: `Order #${order.id} has been successfully placed.` });
        setLocation(`/orders/${order.id}`);
      },
      onError: (err: any) => {
        toast({ title: "Order failed", description: err.error || "Failed to place order.", variant: "destructive" });
      }
    });
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/cart")} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-serif font-bold">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              
              {/* Delivery Details */}
              <section className="bg-card border border-border/50 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Delivery Details</h2>
                </div>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="deliveryPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="01XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deliveryAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="House, Road, Block/Sector, Area, City" 
                            className="min-h-[100px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Note (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Any special instructions for delivery or seller?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-card border border-border/50 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center">
                    <Banknote className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">Payment Method</h2>
                </div>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          <FormItem>
                            <FormControl><RadioGroupItem value="cod" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center gap-4 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                                <Banknote className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="font-bold block">Cash on Delivery</span>
                                <span className="text-xs text-muted-foreground">Pay when you receive</span>
                              </div>
                            </FormLabel>
                          </FormItem>

                          <FormItem>
                            <FormControl><RadioGroupItem value="bkash" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center gap-4 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-[#E2136E] peer-data-[state=checked]:bg-[#E2136E]/5 cursor-pointer transition-all">
                              <div className="w-10 h-10 rounded-full bg-[#E2136E] text-white flex items-center justify-center shrink-0 font-bold italic">
                                bK
                              </div>
                              <div>
                                <span className="font-bold block text-[#E2136E]">bKash</span>
                                <span className="text-xs text-muted-foreground">Mobile Banking</span>
                              </div>
                            </FormLabel>
                          </FormItem>

                          <FormItem>
                            <FormControl><RadioGroupItem value="nagad" className="peer sr-only" /></FormControl>
                            <FormLabel className="flex items-center gap-4 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent peer-data-[state=checked]:border-[#F7931E] peer-data-[state=checked]:bg-[#F7931E]/5 cursor-pointer transition-all">
                              <div className="w-10 h-10 rounded-full bg-[#F7931E] text-white flex items-center justify-center shrink-0 font-bold">
                                N
                              </div>
                              <div>
                                <span className="font-bold block text-[#F7931E]">Nagad</span>
                                <span className="text-xs text-muted-foreground">Mobile Banking</span>
                              </div>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </section>

              <div className="hidden lg:block">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full rounded-full py-7 text-lg font-bold"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Place Order
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Secure checkout. Empowering artisans.
                </p>
              </div>
            </form>
          </Form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 md:p-8 sticky top-28">
            <h3 className="font-serif text-2xl font-bold mb-6">In your bag</h3>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cart?.items.map(item => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted"></div>
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-serif font-bold leading-tight line-clamp-2">{item.productTitle}</p>
                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="font-medium text-primary">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator className="mb-6" />
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart?.itemCount || 0} items)</span>
                <span>৳{(cart?.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>৳60</span>
              </div>
            </div>
            
            <Separator className="mb-6" />
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-serif text-xl font-bold">Total to Pay</span>
              <span className="font-serif text-3xl font-bold text-primary">৳{((cart?.total || 0) + 60).toLocaleString()}</span>
            </div>

            <div className="lg:hidden mt-8">
              <Button 
                onClick={form.handleSubmit(onSubmit)}
                size="lg" 
                className="w-full rounded-full py-6 text-lg font-bold"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

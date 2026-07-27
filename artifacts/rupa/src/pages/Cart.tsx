import { Link, useLocation } from "wouter";
import { useGetCart, useRemoveFromCart, useClearCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const { toast } = useToast();

  const handleRemove = (productId: number) => {
    removeFromCart.mutate({ productId }, {
      onSuccess: () => toast({ title: "Item removed", description: "The item has been removed from your bag." })
    });
  };

  const handleClear = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => toast({ title: "Cart cleared", description: "Your shopping bag is now empty." })
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold mb-8">Shopping Bag</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-4">Your bag is empty</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your bag yet. Discover beautiful handmade products from our artisans.
        </p>
        <Button size="lg" asChild className="rounded-full px-8">
          <Link href="/products">Explore the Bazaar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold">Shopping Bag</h1>
        <span className="text-muted-foreground font-medium">{cart.itemCount} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {cart.items.map((item) => (
              <Card key={item.productId} className="overflow-hidden border-border/50">
                <CardContent className="p-4 sm:p-6 flex gap-4 sm:gap-6 items-center">
                  <Link href={`/products/${item.productId}`}>
                    <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-muted border border-border/50">
                      {item.productImage ? (
                        <img src={item.productImage} alt={item.productTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                  </Link>
                  
                  <div className="flex-1 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                    <div>
                      <Link href={`/products/${item.productId}`}>
                        <h3 className="font-serif font-bold text-lg hover:text-primary transition-colors line-clamp-2 mb-1">{item.productTitle}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-2">Sold by {item.sellerName}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-foreground">Qty: {item.quantity}</span>
                        <button 
                          onClick={() => handleRemove(item.productId)}
                          className="text-muted-foreground hover:text-destructive flex items-center transition-colors"
                          disabled={removeFromCart.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="font-serif font-bold text-xl text-primary">৳{(item.price * item.quantity).toLocaleString()}</span>
                      {item.quantity > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">৳{item.price.toLocaleString()} each</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 flex justify-start">
            <Button variant="outline" className="text-muted-foreground" onClick={handleClear} disabled={clearCart.isPending}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear Bag
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-muted/30 border border-border/50 rounded-3xl p-6 md:p-8 sticky top-28">
            <h3 className="font-serif text-2xl font-bold mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({cart.itemCount} items)</span>
                <span>৳{cart.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Delivery</span>
                <span>৳60</span>
              </div>
            </div>
            
            <Separator className="mb-6" />
            
            <div className="flex justify-between items-end mb-8">
              <span className="font-serif text-xl font-bold">Total</span>
              <span className="font-serif text-3xl font-bold text-primary">৳{(cart.total + 60).toLocaleString()}</span>
            </div>
            
            <Button 
              size="lg" 
              className="w-full rounded-full py-6 text-lg group"
              onClick={() => setLocation("/checkout")}
            >
              Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              Taxes will be calculated at checkout if applicable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

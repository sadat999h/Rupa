import { useState } from "react";
import { Link } from "wouter";
import { useGetProducts, useAddToCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChefHat, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";

export default function Food() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: productsData, isLoading } = useGetProducts({
    search: debouncedSearch || undefined,
    kitchenOnly: true,
  });

  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => toast({ title: "Added to cart", description: "Item added to your cart." }),
        onError: (err: any) => toast({ title: "Error", description: err.error || "Failed to add to cart.", variant: "destructive" }),
      }
    );
  };

  const items = productsData?.products ?? [];

  return (
    <div>
      <div className="bg-gradient-to-b from-amber-50/60 to-background border-b border-border/50">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-6 py-1.5 px-4 rounded-full border-none">
            <ChefHat className="w-3.5 h-3.5 mr-1.5" /> Rupa Food
          </Badge>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Homemade Meals from Local Kitchens
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Order fresh, authentic Bengali dishes made by real women in real homes.
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search dishes, cuisine, or kitchens..."
              className="pl-12 py-6 rounded-full text-base bg-card shadow-sm border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {user?.role === "seller" && (
            <div className="mt-6">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/dashboard/kitchen">Start selling your home food</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <p className="text-muted-foreground mb-6">
          Showing <span className="font-medium text-foreground">{productsData?.total || 0}</span> dishes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-[4/5] rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-serif text-xl font-semibold mb-2">No dishes found</h3>
              <p className="text-muted-foreground">Try a different search or check back later.</p>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-all border-border/50 bg-card h-full flex flex-col">
                <Link href={`/products/${item.id}`} className="flex-1 flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <UtensilsCrossed className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        onClick={(e) => handleAddToCart(e, item.id)}
                        disabled={item.stock === 0 || addToCart.isPending}
                        className="rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" /> {item.stock === 0 ? "Sold Out" : "Add to Cart"}
                      </Button>
                    </div>

                    {item.stock > 0 && item.stock < 5 && (
                      <Badge variant="destructive" className="absolute top-3 left-3 border-none">
                        Only {item.stock} left
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-serif font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                      <span className="font-semibold text-primary shrink-0">৳{item.price.toLocaleString()}</span>
                    </div>
                    {item.titleBn && <p className="text-sm font-serif text-muted-foreground line-clamp-1">{item.titleBn}</p>}

                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                      {item.kitchenId ? (
                        <Link
                          href={`/food/${item.kitchenId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm text-muted-foreground flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <ChefHat className="w-3.5 h-3.5" /> <span className="line-clamp-1">{item.kitchenName || "Home Kitchen"}</span>
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <ChefHat className="w-3.5 h-3.5" /> {item.kitchenName || "Home Kitchen"}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

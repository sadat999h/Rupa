import { Link, useParams } from "wouter";
import { useGetKitchen, getGetKitchenQueryKey, useAddToCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, ArrowLeft, ShoppingBag, UtensilsCrossed, ChefHat } from "lucide-react";

export default function KitchenDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();

  const { data: kitchen, isLoading } = useGetKitchen(id, {
    query: { queryKey: getGetKitchenQueryKey(id), enabled: !!id },
  });

  const addToCart = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => toast({ title: "Added to cart", description: "Item added to your cart." }),
        onError: (err: any) => toast({ title: "Error", description: err.error || "Failed to add to cart.", variant: "destructive" }),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-56 w-full rounded-3xl mb-12" />
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!kitchen) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Kitchen not found</h2>
        <Button asChild><Link href="/food">Back to Food</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="relative h-56 md:h-72 bg-gradient-to-r from-orange-100/60 to-amber-50/60 overflow-hidden">
        {kitchen.coverImage && (
          <img src={kitchen.coverImage} alt={kitchen.name} className="absolute inset-0 w-full h-full object-cover opacity-70" />
        )}
        <div className="container mx-auto px-4 h-full flex flex-col justify-between pt-6 relative">
          <Button variant="ghost" asChild className="self-start text-foreground/70 hover:text-foreground bg-white/60 backdrop-blur rounded-full">
            <Link href="/food"><ArrowLeft className="mr-2 h-4 w-4" /> Food</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative -mt-16 md:-mt-20">
        <div className="bg-card rounded-3xl p-6 md:p-10 shadow-lg border border-border/50 mb-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">{kitchen.name}</h1>
                <Badge className={kitchen.isOpen ? "bg-emerald-50 text-emerald-700 border-none" : "bg-muted text-muted-foreground border-none"}>
                  {kitchen.isOpen ? "Open" : "Closed"}
                </Badge>
              </div>
              {kitchen.nameBn && <h2 className="text-xl font-serif text-muted-foreground mb-3">{kitchen.nameBn}</h2>}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {kitchen.location || "Dhaka, Bangladesh"}</span>
                {kitchen.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {kitchen.phone}</span>}
                {kitchen.cuisineType && <Badge variant="outline" className="bg-background">{kitchen.cuisineType}</Badge>}
              </div>
              <p className="text-muted-foreground max-w-2xl">{kitchen.description}</p>
              <p className="text-sm text-muted-foreground mt-2">By {kitchen.ownerName}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-serif font-bold mb-8 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-primary" /> Menu
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kitchen.foodItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                This kitchen hasn't added any dishes yet.
              </div>
            ) : (
              kitchen.foodItems.map((item) => (
                <Card key={item.id} className="overflow-hidden group hover:shadow-md transition-all border-border/50 bg-card flex flex-col h-full">
                  <Link href={`/products/${item.id}`} className="flex-1 flex flex-col">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {item.images[0] ? (
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <UtensilsCrossed className="w-8 h-8 opacity-40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-serif font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                        <span className="font-semibold text-primary shrink-0">৳{item.price.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{item.description}</p>
                      <Button
                        onClick={(e) => handleAddToCart(e, item.id)}
                        disabled={item.stock === 0 || addToCart.isPending}
                        className="w-full rounded-full mt-auto"
                        variant="secondary"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" /> {item.stock === 0 ? "Sold Out" : "Add to Cart"}
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

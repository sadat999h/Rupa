import { useState } from "react";
import { Link } from "wouter";
import { useGetKitchens } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, ChefHat, ArrowRight, UtensilsCrossed } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/context/auth";

export default function Food() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { user } = useAuth();

  const { data, isLoading } = useGetKitchens({
    search: debouncedSearch || undefined,
  });

  const kitchens = data?.kitchens ?? [];

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
            Discover home kitchens and home cooks near you. Order fresh, authentic Bengali food, made by real women in real homes.
          </p>

          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search kitchens, cuisine, or dishes..."
              className="pl-12 py-6 rounded-full text-base bg-card shadow-sm border-border/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {user?.role === "seller" && (
            <div className="mt-6">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/dashboard/kitchen">
                  Start selling your home food <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden border-border/50 bg-card">
                <Skeleton className="w-full aspect-[16/10]" />
                <CardContent className="p-5 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : kitchens.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-serif text-xl font-semibold mb-2">No kitchens found</h3>
              <p className="text-muted-foreground">Try a different search or check back later.</p>
            </div>
          ) : (
            kitchens.map((kitchen) => (
              <Card key={kitchen.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card flex flex-col">
                <Link href={`/food/${kitchen.id}`} className="flex flex-col h-full">
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {kitchen.coverImage ? (
                      <img
                        src={kitchen.coverImage}
                        alt={kitchen.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <UtensilsCrossed className="w-10 h-10 opacity-40" />
                      </div>
                    )}
                    {!kitchen.isOpen && (
                      <Badge className="absolute top-3 left-3 bg-background/90 text-foreground border-none">Closed</Badge>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-primary transition-colors">{kitchen.name}</h3>
                    </div>
                    {kitchen.nameBn && <p className="text-sm font-serif text-muted-foreground mb-2">{kitchen.nameBn}</p>}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{kitchen.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3 mt-auto">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {kitchen.location || "Dhaka, BD"}</span>
                      {kitchen.cuisineType && <Badge variant="outline" className="bg-background">{kitchen.cuisineType}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{kitchen.foodItemCount} dish{kitchen.foodItemCount === 1 ? "" : "es"} available</p>
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

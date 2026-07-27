import { useState } from "react";
import { Link } from "wouter";
import { useGetSellers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Star, Store, ArrowRight } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Sellers() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: sellers, isLoading } = useGetSellers({
    search: debouncedSearch || undefined,
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
      <div className="max-w-3xl mb-16">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 py-1.5 px-4 rounded-full border-none">
          Our Community
        </Badge>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Meet the Artisans</h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
          Discover the incredible women behind the products. Every purchase directly empowers a Bangladeshi woman entrepreneur.
        </p>
        
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search artisans by name or location..." 
            className="pl-12 py-6 rounded-full text-base bg-card shadow-sm border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-10 w-full rounded-full" />
              </CardContent>
            </Card>
          ))
        ) : sellers?.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-serif text-xl font-semibold mb-2">No artisans found</h3>
            <p className="text-muted-foreground">Try a different search term.</p>
          </div>
        ) : (
          sellers?.map((seller) => (
            <Card key={seller.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-border/50 group-hover:border-primary/30 transition-colors">
                      {seller.avatar ? (
                        <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-serif text-xl text-muted-foreground">
                          {seller.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg leading-tight group-hover:text-primary transition-colors">{seller.name}</h3>
                      {seller.nameBn && <p className="text-sm font-serif text-muted-foreground mb-1">{seller.nameBn}</p>}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {seller.location || 'Dhaka, BD'}
                      </div>
                    </div>
                  </div>
                  {seller.isVerified && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none px-2 py-0.5 shadow-sm">Verified</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10">
                  {seller.bio || `Artisan creating beautiful handmade products for the Rupa community.`}
                </p>
                
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/40 mb-6">
                  <div className="text-center">
                    <p className="text-xl font-bold font-serif text-foreground">{seller.productCount}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Products</p>
                  </div>
                  <div className="text-center border-l border-border/40">
                    <div className="flex items-center justify-center gap-1 text-xl font-bold font-serif text-foreground">
                      {seller.avgRating?.toFixed(1) || '5.0'} <Star className="w-4 h-4 fill-amber-500 text-amber-500 -mt-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Rating</p>
                  </div>
                </div>
                
                <Button variant="outline" asChild className="w-full rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  <Link href={`/sellers/${seller.id}`}>
                    Visit Shop <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import { Link, useParams } from "wouter";
import { useGetSellerProfile, useGetProducts, getGetSellerProfileQueryKey, getGetProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, Calendar, ShoppingBag, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function SellerProfile() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: profile, isLoading: isLoadingProfile } = useGetSellerProfile(id, {
    query: { queryKey: getGetSellerProfileQueryKey(id), enabled: !!id }
  });

  const { data: productsData, isLoading: isLoadingProducts } = useGetProducts(
    { sellerId: id },
    { query: { queryKey: getGetProductsQueryKey({ sellerId: id }), enabled: !!id } }
  );

  // Home Food items live on this seller's Kitchen page, not their Artisan shop.
  const craftProducts = productsData?.products.filter((p) => !p.kitchenId) ?? [];

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-64 w-full rounded-3xl mb-12" />
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Seller not found</h2>
        <Button asChild><Link href="/sellers">Back to Artisans</Link></Button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Cover/Header Section */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-40 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-between pt-6">
          <Button variant="ghost" asChild className="self-start text-foreground/70 hover:text-foreground bg-white/50 backdrop-blur rounded-full">
            <Link href="/sellers"><ArrowLeft className="mr-2 h-4 w-4" /> Artisans</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 relative -mt-24 md:-mt-32">
        <div className="bg-card rounded-3xl p-6 md:p-10 shadow-lg border border-border/50 mb-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full border-4 border-background overflow-hidden shadow-md -mt-16 md:-mt-24 bg-muted z-10 relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-5xl text-muted-foreground">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">{profile.name}</h1>
                  {profile.nameBn && <h2 className="text-xl font-serif text-muted-foreground">{profile.nameBn}</h2>}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location || 'Dhaka, Bangladesh'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {format(new Date(profile.joinedAt), 'MMMM yyyy')}</span>
                    {profile.isVerified && <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none font-medium">Verified Artisan</Badge>}
                  </div>
                </div>

                <div className="flex items-center gap-6 bg-muted/50 p-4 rounded-2xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold font-serif text-foreground">{profile.productCount}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Products</p>
                  </div>
                  <div className="w-px h-10 bg-border"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold font-serif text-foreground">{profile.totalSales}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Sales</p>
                  </div>
                  <div className="w-px h-10 bg-border"></div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold font-serif text-foreground">
                      {profile.avgRating?.toFixed(1) || '5.0'} <Star className="w-5 h-5 fill-amber-500 text-amber-500 -mt-0.5" />
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Rating</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-stone text-muted-foreground max-w-none mt-6">
                <p>{profile.bio || `${profile.name} is a passionate artisan bringing the best of Bangladeshi craftsmanship to you.`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Products */}
        <div>
          <h3 className="text-3xl font-serif font-bold mb-8">Shop Collection</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingProducts ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[4/5] rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : craftProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
                This artisan hasn't added any products yet.
              </div>
            ) : (
              craftProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-all border-border/50 bg-card flex flex-col h-full">
                  <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                      {product.images[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button className="rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                          <ShoppingBag className="mr-2 h-4 w-4" /> View Details
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-serif font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                        <span className="font-semibold text-primary shrink-0">৳{product.price.toLocaleString()}</span>
                      </div>
                      <Badge variant="outline" className="w-fit mt-auto bg-background">{product.categoryName}</Badge>
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

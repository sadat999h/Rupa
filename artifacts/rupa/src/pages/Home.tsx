import { Link } from "wouter";
import { motion } from "framer-motion";
import { useGetFeaturedProducts, useGetTopSellers, useGetMarketplaceSummary } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Star, MapPin, Store } from "lucide-react";

// @ts-ignore
import heroMarketImg from "@assets/generated_images/hero_market.jpg";
// @ts-ignore
import catClothingImg from "@assets/generated_images/cat_clothing.jpg";
// @ts-ignore
import catFoodImg from "@assets/generated_images/cat_food.jpg";
// @ts-ignore
import catHandicraftImg from "@assets/generated_images/cat_handicraft.jpg";

const CATEGORIES = [
  { id: 1, name: "Handicrafts", nameBn: "হস্তশিল্প", slug: "handicrafts", image: catHandicraftImg, count: "1,200+" },
  { id: 2, name: "Home Food", nameBn: "ঘরের খাবার", slug: "home-food", image: catFoodImg, count: "800+" },
  { id: 3, name: "Clothing", nameBn: "পোশাক", slug: "clothing", image: catClothingImg, count: "2,500+" },
];

export default function Home() {
  const { data: featuredProducts, isLoading: isLoadingFeatured } = useGetFeaturedProducts();
  const { data: topSellers, isLoading: isLoadingSellers } = useGetTopSellers();
  const { data: summary } = useGetMarketplaceSummary();

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40 z-10" />
          <img 
            src={heroMarketImg} 
            alt="Bangladeshi Artisan Market" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="container relative z-20 px-4 md:px-8 mt-12">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 mb-6 text-sm py-1.5 px-4 rounded-full border-none">
                Empowering 10,000+ Women Entrepreneurs
              </Badge>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight tracking-tight mb-6">
                The soul of <span className="text-primary italic">Bengal</span>,<br/> delivered to you.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
                Discover exquisite handcrafted sarees, authentic homemade delicacies, and unique artisanal treasures directly from the talented women of Bangladesh.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" asChild className="w-full sm:w-auto rounded-full text-base px-8 py-6">
                  <Link href="/products">Shop the Bazaar</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto rounded-full text-base px-8 py-6 bg-white/50 backdrop-blur border-border/50">
                  <Link href="/sellers">Meet the Artisans</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-border/50 text-center">
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold text-primary mb-1">{summary?.totalSellers || "1,200"}+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Women Sellers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold text-primary mb-1">{summary?.totalProducts || "8,500"}+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unique Products</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold text-primary mb-1">{summary?.totalCategories || "12"}</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Categories</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold text-primary mb-1">{summary?.totalOrders || "45,000"}+</span>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Happy Orders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Explore Categories</h2>
              <p className="text-muted-foreground">Browse our most popular artisan collections.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:flex group">
              <Link href="/products">
                View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/products?category=${cat.slug}`}>
                  <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <div className="flex items-baseline gap-3 mb-2">
                        <h3 className="text-2xl font-serif font-bold text-white">{cat.name}</h3>
                        <span className="text-lg text-white/80 font-serif">{cat.nameBn}</span>
                      </div>
                      <p className="text-white/90 text-sm">{cat.count} items</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-card border-y border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Editor's Picks</h2>
            <p className="text-muted-foreground">Hand-selected items from our finest creators.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingFeatured ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[4/5] rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : featuredProducts?.slice(0, 4).map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-all border-border/50 bg-background">
                <Link href={`/products/${product.id}`}>
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
                    {product.stock < 5 && (
                      <Badge variant="destructive" className="absolute top-3 left-3">
                        Only {product.stock} left
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <h3 className="font-serif font-semibold text-lg line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Store className="w-3 h-3" /> {product.sellerName}
                        </p>
                      </div>
                      <span className="font-semibold text-primary">৳{product.price.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="outline" asChild className="rounded-full px-8">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Top Sellers */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3">Celebrated Artisans</h2>
            <p className="text-muted-foreground">Meet the women behind the magic.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {isLoadingSellers ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4">
                  <Skeleton className="w-32 h-32 rounded-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : topSellers?.slice(0, 4).map((seller) => (
              <Link key={seller.id} href={`/sellers/${seller.id}`}>
                <div className="flex flex-col items-center text-center group">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-background shadow-md group-hover:border-primary/20 transition-all">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-2xl font-serif text-muted-foreground">
                        {seller.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-xl mb-1 group-hover:text-primary transition-colors">{seller.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{seller.location || 'Dhaka, Bangladesh'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded text-sm font-medium">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{seller.avgRating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

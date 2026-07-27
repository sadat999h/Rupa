import { useState, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { useGetProducts, useGetCategories, useAddToCart } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, Store, ShoppingBag, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Products() {
  const [searchParams] = useSearch();
  const urlCategory = new URLSearchParams(searchParams).get("category") || "";
  
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [category, setCategory] = useState(urlCategory);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: categories } = useGetCategories();
  const { data: productsData, isLoading } = useGetProducts({
    search: debouncedSearch || undefined,
    category: category || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  });

  const addToCart = useAddToCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate({ data: { productId, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: "Item added to your shopping bag." });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">The Bazaar</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Discover unique handmade products crafted with love and tradition. Every purchase supports a woman entrepreneur.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`md:w-64 shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-serif font-semibold text-lg mb-4">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9 bg-card"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h3 className="font-serif font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategory("")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === "" ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  All Categories
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${category === cat.slug ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    <span>{cat.name} <span className="opacity-70 ml-1 font-serif text-xs">{cat.nameBn}</span></span>
                    <span className="opacity-70 text-xs">{cat.productCount}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif font-semibold text-lg">Price Range</h3>
                <span className="text-xs font-medium text-primary">৳{priceRange[0]} - ৳{priceRange[1]}</span>
              </div>
              <Slider
                defaultValue={[0, 10000]}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={setPriceRange}
                className="my-4"
              />
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{productsData?.total || 0}</span> products
            </p>
            <Button 
              variant="outline" 
              className="md:hidden"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[4/5] rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : productsData?.products.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                <Button 
                  variant="outline" 
                  className="mt-6 rounded-full"
                  onClick={() => { setSearch(""); setCategory(""); setPriceRange([0, 10000]); }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              productsData?.products.map((product) => (
                <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-all border-border/50 bg-card h-full flex flex-col">
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
                        <Button 
                          onClick={(e) => handleAddToCart(e, product.id)}
                          className="rounded-full translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg"
                        >
                          <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                        </Button>
                      </div>

                      {product.stock < 5 && (
                        <Badge variant="destructive" className="absolute top-3 left-3 border-none">
                          Only {product.stock} left
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1">
                      <div className="mb-2">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h3 className="font-serif font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                          <span className="font-semibold text-primary shrink-0">৳{product.price.toLocaleString()}</span>
                        </div>
                        {product.titleBn && <p className="text-sm font-serif text-muted-foreground line-clamp-1">{product.titleBn}</p>}
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/40">
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 hover:text-foreground transition-colors">
                          <Store className="w-3.5 h-3.5" /> <span className="line-clamp-1">{product.sellerName}</span>
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

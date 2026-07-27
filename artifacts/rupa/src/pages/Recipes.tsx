import { useState } from "react";
import { Link } from "wouter";
import { useGetRecipes } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChefHat, Clock, ShoppingBag } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Recipes() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: recipesData, isLoading } = useGetRecipes({
    search: debouncedSearch || undefined,
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <Badge className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 mb-6 py-1.5 px-4 rounded-full border-none">
          Home Kitchen
        </Badge>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">Authentic Recipes from Bengali Homes</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Discover traditional recipes passed down through generations. Cook them yourself, or buy the ready-made dish from the creator.
        </p>
        
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for biryani, pitha, curries..." 
            className="pl-12 py-6 rounded-full text-base bg-card shadow-sm border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full aspect-video rounded-2xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : recipesData?.recipes.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-serif text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-muted-foreground">Try a different search term.</p>
          </div>
        ) : (
          recipesData?.recipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card rounded-2xl flex flex-col">
              <Link href={`/recipes/${recipe.id}`} className="flex-1 flex flex-col">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {recipe.images[0] ? (
                    <img 
                      src={recipe.images[0]} 
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                      <ChefHat className="h-10 w-10 opacity-20" />
                    </div>
                  )}
                  {recipe.isForSale && (
                    <Badge className="absolute top-4 right-4 bg-primary text-white border-none shadow-sm">
                      <ShoppingBag className="w-3 h-3 mr-1" /> Order Now
                    </Badge>
                  )}
                </div>
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-serif font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors mb-1">{recipe.title}</h3>
                    {recipe.titleBn && <p className="text-sm font-serif text-muted-foreground">{recipe.titleBn}</p>}
                  </div>
                  
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                    {recipe.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted overflow-hidden border border-border/50">
                        {recipe.authorAvatar ? (
                          <img src={recipe.authorAvatar} alt={recipe.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-serif bg-secondary/10 text-secondary-foreground">
                            {recipe.authorName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-foreground">{recipe.authorName}</span>
                    </div>
                    {recipe.isForSale && recipe.price && (
                      <span className="font-semibold text-primary">৳{recipe.price}</span>
                    )}
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

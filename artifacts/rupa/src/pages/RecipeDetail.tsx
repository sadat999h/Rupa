import { Link, useParams } from "wouter";
import { useGetRecipe, useAddToCart, getGetRecipeQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ChefHat, ShoppingBag, Clock, Users } from "lucide-react";

export default function RecipeDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);

  const { data: recipe, isLoading } = useGetRecipe(id, {
    query: { queryKey: getGetRecipeQueryKey(id), enabled: !!id }
  });

  const addToCart = useAddToCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="w-full aspect-video rounded-3xl mb-8" />
        <div className="space-y-4 text-center mb-12">
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="h-6 w-1/3 mx-auto" />
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Recipe not found</h2>
        <Button asChild><Link href="/recipes">Back to Recipes</Link></Button>
      </div>
    );
  }

  const handleOrder = () => {
    // Assuming there's a corresponding product for this recipe, 
    // or the recipe ID acts as a product ID in this simplified model.
    // In a real app, recipe might map to a specific productId. 
    // We'll use the recipe ID and assume backend handles it or we'd have a productId field.
    addToCart.mutate({ data: { productId: recipe.id, quantity: 1 } }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: `${recipe.title} added to your bag.` });
      }
    });
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/recipes"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Recipes</Link>
      </Button>

      <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden bg-muted mb-10 relative">
        {recipe.images[0] ? (
          <img src={recipe.images[0]} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5">
            <ChefHat className="h-20 w-20 text-primary/20" />
          </div>
        )}
      </div>

      <div className="text-center mb-12 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">{recipe.title}</h1>
        {recipe.titleBn && <h2 className="text-2xl font-serif text-muted-foreground mb-6">{recipe.titleBn}</h2>}
        
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">
          {recipe.description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-foreground font-medium bg-card border border-border/50 py-4 px-6 rounded-2xl inline-flex">
          <Link href={`/sellers/${recipe.authorId}`} className="flex items-center gap-2 hover:text-primary transition-colors">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted">
              {recipe.authorAvatar ? (
                <img src={recipe.authorAvatar} alt={recipe.authorName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-serif text-xs">
                  {recipe.authorName.charAt(0)}
                </div>
              )}
            </div>
            <span>By {recipe.authorName}</span>
          </Link>
          <div className="w-px h-4 bg-border/50 hidden sm:block"></div>
          {recipe.isForSale && recipe.price && (
            <div className="flex items-center gap-2 text-primary">
              <ShoppingBag className="w-4 h-4" /> Available to order: ৳{recipe.price}
            </div>
          )}
        </div>
      </div>

      {recipe.isForSale && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 mb-16 text-center max-w-2xl mx-auto">
          <h3 className="font-serif text-2xl font-bold mb-3">Craving this dish?</h3>
          <p className="text-muted-foreground mb-6">Let {recipe.authorName} cook it for you! Order now for authentic homemade taste.</p>
          <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-md" onClick={handleOrder}>
            <ShoppingBag className="mr-2 h-5 w-5" /> Order Now for ৳{recipe.price}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
        <div className="md:col-span-1 space-y-8">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
              Ingredients
            </h3>
            <ul className="space-y-4">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></div>
                  <span className="text-foreground/90">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-6">Instructions</h3>
            <div className="space-y-8">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-secondary/20 text-secondary-foreground font-serif font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-foreground/90 leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

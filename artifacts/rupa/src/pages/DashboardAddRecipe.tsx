import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateRecipe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Plus, X, ImagePlus, ChefHat } from "lucide-react";
import { useAuth } from "@/context/auth";

const recipeSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  titleBn: z.string().optional(),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  ingredients: z.array(z.string().min(1)).min(1, { message: "Add at least one ingredient" }),
  steps: z.array(z.string().min(1)).min(1, { message: "Add at least one step" }),
  isForSale: z.boolean().default(false),
  price: z.coerce.number().optional(),
});

export default function DashboardAddRecipe() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentStep, setCurrentStep] = useState("");

  const createRecipe = useCreateRecipe();

  const form = useForm<z.infer<typeof recipeSchema>>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      titleBn: "",
      description: "",
      ingredients: [],
      steps: [],
      isForSale: false,
      price: 0,
    },
  });

  const watchIsForSale = form.watch("isForSale");
  const watchIngredients = form.watch("ingredients");
  const watchSteps = form.watch("steps");

  const handleAddImage = () => {
    if (currentImageUrl && currentImageUrl.startsWith('http')) {
      setImages([...images, currentImageUrl]);
      setCurrentImageUrl("");
    } else {
      toast({ title: "Invalid URL", description: "Please enter a valid image URL", variant: "destructive" });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      form.setValue("ingredients", [...watchIngredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    form.setValue("ingredients", watchIngredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    if (currentStep.trim()) {
      form.setValue("steps", [...watchSteps, currentStep.trim()]);
      setCurrentStep("");
    }
  };

  const handleRemoveStep = (index: number) => {
    form.setValue("steps", watchSteps.filter((_, i) => i !== index));
  };

  function onSubmit(values: z.infer<typeof recipeSchema>) {
    if (images.length === 0) {
      toast({ title: "Image required", description: "Please add at least one image URL", variant: "destructive" });
      return;
    }

    const payload: any = {
      ...values,
      images,
      price: values.isForSale ? values.price : undefined,
    };

    createRecipe.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast({ title: "Recipe added!", description: "Your recipe has been published successfully." });
          setLocation("/recipes");
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.error || "Failed to create recipe.", variant: "destructive" });
        }
      }
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Add New Recipe</h1>
        <p className="text-muted-foreground">Share a recipe from your kitchen. Optionally sell the ready-made dish.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold border-b border-border/50 pb-2">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Title (English)</FormLabel>
                      <FormControl><Input placeholder="e.g. Shorshe Ilish" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="titleBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Bengali) - Optional</FormLabel>
                      <FormControl><Input placeholder="e.g. সর্ষে ইলিশ" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the recipe, its origins, and what makes it special."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold border-b border-border/50 pb-2">Ingredients</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 500g hilsa fish"
                    value={currentIngredient}
                    onChange={(e) => setCurrentIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIngredient())}
                  />
                  <Button type="button" onClick={handleAddIngredient} variant="secondary">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchIngredients.map((ing, idx) => (
                    <div key={idx} className="bg-secondary/30 text-secondary-foreground px-3 py-1.5 rounded-full text-sm flex items-center gap-2">
                      {ing}
                      <button type="button" onClick={() => handleRemoveIngredient(idx)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold border-b border-border/50 pb-2">Instructions</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a step..."
                    value={currentStep}
                    onChange={(e) => setCurrentStep(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStep())}
                  />
                  <Button type="button" onClick={handleAddStep} variant="secondary" className="self-start">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {watchSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="flex-1 text-sm">{step}</p>
                      <button type="button" onClick={() => handleRemoveStep(idx)} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold border-b border-border/50 pb-2">Images</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL (e.g. https://...)"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  />
                  <Button type="button" onClick={handleAddImage} variant="secondary">
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted">
                      <img src={url} alt={`Recipe ${idx+1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                      <ImagePlus className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Add Image</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-serif font-bold border-b border-border/50 pb-2">Selling Options</h3>
              <div className="flex items-center gap-3 p-4 bg-muted rounded-2xl">
                <input
                  type="checkbox"
                  id="isForSale"
                  checked={watchIsForSale}
                  onChange={(e) => form.setValue("isForSale", e.target.checked)}
                  className="w-5 h-5 rounded border-border text-primary"
                />
                <label htmlFor="isForSale" className="flex items-center gap-2 font-medium cursor-pointer">
                  <ChefHat className="w-4 h-4" /> I want to sell this ready-made dish
                </label>
              </div>

              {watchIsForSale && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (৳)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g. 350" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="pt-4 border-t border-border/50 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild className="rounded-full px-6">
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" className="rounded-full px-8" disabled={createRecipe.isPending}>
                {createRecipe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Recipe
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

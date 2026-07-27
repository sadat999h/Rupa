import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetCategories, useCreateProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, ImagePlus, Plus, X } from "lucide-react";
import { useAuth } from "@/context/auth";

const productSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  titleBn: z.string().optional(),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
  categorySlug: z.string().min(1, { message: "Please select a category" }),
  stock: z.coerce.number().min(0, { message: "Stock cannot be negative" }),
});

export default function DashboardAddProduct() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const { data: categories } = useGetCategories();
  const createProduct = useCreateProduct();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      titleBn: "",
      description: "",
      price: 0,
      categorySlug: "",
      stock: 1,
    },
  });

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

  function onSubmit(values: z.infer<typeof productSchema>) {
    if (images.length === 0) {
      toast({ title: "Images required", description: "Please add at least one image URL", variant: "destructive" });
      return;
    }

    createProduct.mutate(
      { data: { ...values, images } },
      {
        onSuccess: () => {
          toast({ title: "Product added!", description: "Your product has been listed successfully." });
          if (user) {
            queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey({ sellerId: user.id }) });
          }
          setLocation("/dashboard/products");
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.error || "Failed to create product.", variant: "destructive" });
        }
      }
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/dashboard/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Products</Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Add New Product</h1>
        <p className="text-muted-foreground">List a new item in your store for buyers to discover.</p>
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
                      <FormLabel>Product Title (English)</FormLabel>
                      <FormControl><Input placeholder="e.g. Handwoven Jamdani Saree" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="e.g. হাতে বোনা জামদানি শাড়ি" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (৳)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Stock</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
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
                        placeholder="Describe your product in detail. What makes it special? How was it made?" 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <img src={url} alt={`Product ${idx+1}`} className="w-full h-full object-cover" />
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

            <div className="pt-4 border-t border-border/50 flex justify-end gap-4">
              <Button type="button" variant="outline" asChild className="rounded-full px-6">
                <Link href="/dashboard/products">Cancel</Link>
              </Button>
              <Button type="submit" className="rounded-full px-8" disabled={createProduct.isPending}>
                {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Product
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

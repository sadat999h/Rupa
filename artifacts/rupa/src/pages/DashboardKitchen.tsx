import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/auth";
import {
  useGetMyKitchen,
  getGetMyKitchenQueryKey,
  useCreateKitchen,
  useUpdateKitchen,
  useCreateProduct,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Plus, UtensilsCrossed } from "lucide-react";

export default function DashboardKitchen() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [description, setDescription] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [location, setLocationField] = useState("");
  const [phone, setPhone] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemStock, setItemStock] = useState("10");
  const [itemImage, setItemImage] = useState("");

  const { data: kitchen, isLoading } = useGetMyKitchen({
    query: { queryKey: getGetMyKitchenQueryKey(), enabled: !!user && user.role === "seller", retry: false },
  });

  const createKitchen = useCreateKitchen({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyKitchenQueryKey() });
        toast({ title: "Kitchen created!", description: "You can now add dishes to your menu." });
      },
      onError: (err: any) => toast({ title: "Error", description: err.error || "Failed to create kitchen.", variant: "destructive" }),
    },
  });

  const updateKitchen = useUpdateKitchen({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyKitchenQueryKey() });
        toast({ title: "Updated", description: "Your kitchen has been updated." });
      },
    },
  });

  const createProduct = useCreateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyKitchenQueryKey() });
        setItemTitle("");
        setItemDescription("");
        setItemPrice("");
        setItemStock("10");
        setItemImage("");
        toast({ title: "Dish added", description: "Your new dish is now on the menu." });
      },
      onError: (err: any) => toast({ title: "Error", description: err.error || "Failed to add dish.", variant: "destructive" }),
    },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }
  if (user.role !== "seller") {
    setLocation("/");
    return null;
  }

  const handleCreateKitchen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      toast({ title: "Missing info", description: "Kitchen name and description are required.", variant: "destructive" });
      return;
    }
    createKitchen.mutate({
      data: {
        name,
        nameBn: nameBn || null,
        description,
        cuisineType: cuisineType || null,
        coverImage: coverImage || null,
        location: location || null,
        phone: phone || null,
      },
    });
  };

  const handleToggleOpen = (isOpen: boolean) => {
    if (!kitchen) return;
    updateKitchen.mutate({ id: kitchen.id, data: { isOpen } });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitchen) return;
    const price = parseFloat(itemPrice);
    const stock = parseInt(itemStock, 10);
    if (!itemTitle.trim() || !itemDescription.trim() || isNaN(price) || price <= 0) {
      toast({ title: "Missing info", description: "Please fill in dish name, description, and a valid price.", variant: "destructive" });
      return;
    }
    createProduct.mutate({
      data: {
        title: itemTitle,
        description: itemDescription,
        price,
        categorySlug: "home-food",
        images: itemImage ? [itemImage] : [],
        stock: isNaN(stock) ? 10 : stock,
        kitchenId: kitchen.id,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  // No kitchen yet — show creation form
  if (!kitchen) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" /> Start Your Home Kitchen
        </h1>
        <p className="text-muted-foreground mb-8">Set up your kitchen profile so buyers can find your homemade food.</p>

        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleCreateKitchen} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Kitchen Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rina's Home Kitchen" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Kitchen Name (Bengali)</label>
                <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="e.g. রিনার রান্নাঘর" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description *</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell buyers what makes your cooking special..." rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cuisine Type</label>
                  <Input value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} placeholder="e.g. Bengali, Home-style" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Location</label>
                  <Input value={location} onChange={(e) => setLocationField(e.target.value)} placeholder="e.g. Dhanmondi, Dhaka" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cover Image URL</label>
                  <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={createKitchen.isPending}>
                {createKitchen.isPending ? "Creating..." : "Create Kitchen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Kitchen exists — manage it + add dishes
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 flex items-center gap-3">
            <ChefHat className="h-8 w-8 text-primary" /> {kitchen.name}
          </h1>
          <p className="text-muted-foreground">Manage your kitchen and menu items.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full">
          <span className="text-sm font-medium">{kitchen.isOpen ? "Open" : "Closed"}</span>
          <Switch checked={kitchen.isOpen} onCheckedChange={handleToggleOpen} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={`/food/${kitchen.id}`}>View Public Page</Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-border/50 mb-10">
        <CardHeader>
          <CardTitle className="font-serif text-xl flex items-center gap-2"><Plus className="w-5 h-5" /> Add a Dish</CardTitle>
          <CardDescription>Add a new item to your menu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Dish Name *</label>
              <Input value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} placeholder="e.g. Chicken Biryani" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description *</label>
              <Textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} placeholder="Describe the dish..." rows={3} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price (৳) *</label>
                <Input type="number" min="1" step="0.01" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="250" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Stock / Servings</label>
                <Input type="number" min="0" value={itemStock} onChange={(e) => setItemStock(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Image URL</label>
                <Input value={itemImage} onChange={(e) => setItemImage(e.target.value)} placeholder="https://..." />
              </div>
            </div>
            <Button type="submit" className="rounded-full" disabled={createProduct.isPending}>
              {createProduct.isPending ? "Adding..." : "Add Dish"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-2xl font-serif font-bold mb-4">Your Menu ({kitchen.foodItems.length})</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kitchen.foodItems.length === 0 ? (
          <div className="col-span-full py-10 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No dishes yet — add your first one above.
          </div>
        ) : (
          kitchen.foodItems.map((item) => (
            <Card key={item.id} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.images[0] && <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="text-sm text-muted-foreground">৳{item.price.toLocaleString()} · Stock: {item.stock}</p>
                </div>
                <Badge variant={item.isActive ? "secondary" : "outline"}>{item.isActive ? "Active" : "Inactive"}</Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

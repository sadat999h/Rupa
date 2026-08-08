import { useState, useEffect } from "react";
import { useUpdateProduct } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@workspace/api-client-react";

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invalidateQueryKey: readonly unknown[];
  /** Label used in the dialog copy, e.g. "product" or "dish" */
  itemLabel?: string;
}

export function EditProductDialog({ product, open, onOpenChange, invalidateQueryKey, itemLabel = "product" }: EditProductDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setImage(product.images[0] ?? "");
    }
  }, [product]);

  const updateProduct = useUpdateProduct({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: invalidateQueryKey });
        toast({ title: "Saved", description: `Your ${itemLabel} has been updated.` });
        onOpenChange(false);
      },
      onError: (err: any) => toast({ title: "Error", description: err.error || `Failed to update ${itemLabel}.`, variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (!title.trim() || !description.trim() || isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Missing info", description: "Please fill in name, description, and a valid price.", variant: "destructive" });
      return;
    }
    updateProduct.mutate({
      id: product.id,
      data: {
        title,
        description,
        price: priceNum,
        stock: isNaN(stockNum) ? product.stock : stockNum,
        images: image ? [image] : [],
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif capitalize">Edit {itemLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description *</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Price (৳) *</label>
              <Input type="number" min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Stock</label>
              <Input type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Image URL</label>
            <Input value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProduct.isPending}>
              {updateProduct.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

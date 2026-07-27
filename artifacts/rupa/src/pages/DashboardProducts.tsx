import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { useGetProducts, useDeleteProduct, getGetProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Edit, Trash2, ArrowLeft, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function DashboardProducts() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'seller') {
    setLocation("/");
    return null;
  }

  const { data: productsData, isLoading } = useGetProducts({ sellerId: user.id });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Product deleted", description: "The product has been removed from your store." });
          queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey({ sellerId: user.id }) });
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
          </Button>
          <h1 className="text-3xl font-serif font-bold mb-2">My Products</h1>
          <p className="text-muted-foreground">Manage your store's inventory and listings.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/add-product"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="w-12 h-12 rounded-lg" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48 mb-2" /><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : productsData?.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                    You haven't listed any products yet. 
                    <Button variant="link" asChild className="p-0 ml-1 text-primary">
                      <Link href="/dashboard/add-product">Add your first product</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                productsData?.products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                        {product.images[0] ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link href={`/products/${product.id}`} className="font-bold hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                      </Link>
                      <span className="text-xs text-muted-foreground mt-1 block">Added {format(new Date(product.createdAt), 'MMM dd, yyyy')}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal bg-card">{product.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">৳{product.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={`font-medium ${product.stock < 5 ? 'text-destructive' : ''}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {product.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 shadow-none font-medium">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none px-2 shadow-none font-medium">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            <Edit className="mr-2 h-4 w-4" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

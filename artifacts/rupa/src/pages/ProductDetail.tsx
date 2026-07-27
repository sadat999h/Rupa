import { useState } from "react";
import { Link, useParams } from "wouter";
import { useGetProduct, useAddToCart, getGetProductQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, Star, Store, MapPin, CheckCircle2 } from "lucide-react";

export default function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useGetProduct(id, {
    query: { queryKey: getGetProductQueryKey(id), enabled: !!id }
  });

  const addToCart = useAddToCart();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl w-full" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif mb-4">Product not found</h2>
        <Button asChild><Link href="/products">Back to Bazaar</Link></Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate({ data: { productId: product.id, quantity } }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: `${quantity}x ${product.title} added to your bag.` });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <Button variant="ghost" asChild className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/products"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Bazaar</Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted border border-border/50">
            {product.images[activeImage] ? (
              <img 
                src={product.images[activeImage]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif">
                No Image
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent hover:border-border'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="mb-6">
            <Badge variant="outline" className="mb-4 text-muted-foreground">
              {product.categoryName} <span className="ml-1 font-serif">{product.categoryNameBn}</span>
            </Badge>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2">
              {product.title}
            </h1>
            {product.titleBn && (
              <h2 className="text-xl md:text-2xl font-serif text-muted-foreground mb-4">
                {product.titleBn}
              </h2>
            )}
            
            <div className="flex items-center gap-4 mt-6">
              <span className="text-4xl font-serif font-bold text-primary">৳{product.price.toLocaleString()}</span>
              {product.stock > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border-none font-medium">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> In Stock ({product.stock})
                </Badge>
              ) : (
                <Badge variant="destructive" className="border-none font-medium">Out of Stock</Badge>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="prose prose-stone prose-p:leading-relaxed text-muted-foreground mb-8">
            <p>{product.description}</p>
          </div>

          <div className="mt-auto space-y-6">
            {/* Add to Cart Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-full bg-card p-1">
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-lg disabled:opacity-50"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button 
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-lg disabled:opacity-50"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <Button 
                size="lg" 
                className="flex-1 rounded-full py-6 text-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addToCart.isPending}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Bag
              </Button>
            </div>

            {/* Seller Info */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border/50">
                  {product.sellerAvatar ? (
                    <img src={product.sellerAvatar} alt={product.sellerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-lg text-muted-foreground">
                      {product.sellerName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-0.5">Sold by</p>
                  <Link href={`/sellers/${product.sellerId}`}>
                    <p className="font-serif font-bold text-lg hover:text-primary transition-colors">{product.sellerName}</p>
                  </Link>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end text-sm text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {product.sellerLocation || 'Dhaka'}
                </div>
                {product.avgRating && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-medium">{product.avgRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section placeholder - can be fully built if needed, but for now we'll just show the count */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-24 max-w-4xl">
          <h3 className="text-2xl font-serif font-bold mb-8">Customer Reviews ({product.reviewCount})</h3>
          <div className="space-y-6">
            {product.reviews.map(review => (
              <div key={review.id} className="border-b border-border/50 pb-6 last:border-0">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex gap-0.5">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="font-medium">{review.buyerName}</span>
                  <span className="text-sm text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { ShoppingBag, Menu, UserCircle, Store, LogOut, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: true } });

  const cartItemCount = cart?.itemCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-8 flex h-20 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-3xl font-bold text-primary tracking-tight">Rupa</span>
            <span className="font-serif text-xl font-medium text-muted-foreground hidden sm:inline-block border-l pl-2 border-border/50">রূপা</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Bazaar</Link>
            <Link href="/food" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Food</Link>
            <Link href="/recipes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Recipes</Link>
            <Link href="/sellers" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Artisans</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative group">
            <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary transition-colors rounded-full">
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
              {cartItemCount > 0 && (
                <Badge variant="default" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border/50 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-6 w-6 text-muted-foreground" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-3">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {user?.role === 'seller' && (
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")} className="cursor-pointer font-medium py-2">
                    <Store className="mr-2 h-4 w-4" />
                    <span>Seller Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setLocation("/orders")} className="cursor-pointer py-2">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>{user?.role === 'seller' ? 'Order History' : 'My Orders'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); setLocation("/"); }} className="cursor-pointer text-destructive focus:text-destructive py-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={() => setLocation("/login")} className="text-muted-foreground hover:text-foreground">Log in</Button>
              <Button onClick={() => setLocation("/register")} className="rounded-full px-6">Join Rupa</Button>
            </div>
          )}

          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setLocation("/products")}>Bazaar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/food")}>Food</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/recipes")}>Recipes</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/sellers")}>Artisans</DropdownMenuItem>
                {!isAuthenticated && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLocation("/login")}>Log in</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLocation("/register")}>Join Rupa</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

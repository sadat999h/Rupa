import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import { AuthProvider } from '@/context/auth';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

// Page Imports
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Food from '@/pages/Food';
import KitchenDetail from '@/pages/KitchenDetail';
import Recipes from '@/pages/Recipes';
import RecipeDetail from '@/pages/RecipeDetail';
import Sellers from '@/pages/Sellers';
import SellerProfile from '@/pages/SellerProfile';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import OrderDetail from '@/pages/OrderDetail';
import Dashboard from '@/pages/Dashboard';
import DashboardProducts from '@/pages/DashboardProducts';
import DashboardAddProduct from '@/pages/DashboardAddProduct';
import DashboardAddRecipe from '@/pages/DashboardAddRecipe';
import DashboardKitchen from '@/pages/DashboardKitchen';
import DashboardProfile from '@/pages/DashboardProfile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

setAuthTokenGetter(() => localStorage.getItem('rupa_token'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1 w-full relative">
        <Switch>
          <Route path="/" component={Home} />
          
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />

          <Route path="/food" component={Food} />
          <Route path="/food/:id" component={KitchenDetail} />
          
          <Route path="/recipes" component={Recipes} />
          <Route path="/recipes/:id" component={RecipeDetail} />
          
          <Route path="/sellers" component={Sellers} />
          <Route path="/sellers/:id" component={SellerProfile} />
          
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          
          <Route path="/orders" component={Orders} />
          <Route path="/orders/:id" component={OrderDetail} />
          
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/dashboard/products" component={DashboardProducts} />
          <Route path="/dashboard/add-product" component={DashboardAddProduct} />
          <Route path="/dashboard/add-recipe" component={DashboardAddRecipe} />
          <Route path="/dashboard/kitchen" component={DashboardKitchen} />
          <Route path="/dashboard/profile" component={DashboardProfile} />
          
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <AppContent />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

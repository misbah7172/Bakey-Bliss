import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { CartProvider } from "./contexts/CartContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ProtectedRoute } from "./lib/protected-route";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetail from "@/pages/product-detail";
import CustomCake from "@/pages/custom-cake";
import CustomChocolate from "@/pages/custom-chocolate";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import CustomerDashboard from "@/pages/customer-dashboard";
import JuniorBakerDashboard from "@/pages/junior-baker-dashboard";
import MainBakerDashboard from "@/pages/main-baker-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/custom-cake" component={CustomCake} />
      <Route path="/custom-chocolate" component={CustomChocolate} />
      <Route path="/cart" component={Cart} />
      <ProtectedRoute path="/checkout" component={Checkout} />
      <ProtectedRoute path="/dashboard/customer" component={CustomerDashboard} />
      <ProtectedRoute path="/dashboard/junior-baker" component={JuniorBakerDashboard} />
      <ProtectedRoute path="/dashboard/main-baker" component={MainBakerDashboard} />
      <ProtectedRoute path="/dashboard/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

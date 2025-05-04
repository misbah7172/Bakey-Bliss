import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, ShoppingCart, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { cartItems, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  
  // Reset warning on component mount
  useEffect(() => {
    setShowEmptyWarning(false);
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Your Cart | BakeryBliss</title>
        <meta name="description" content="Review your shopping cart and proceed to checkout" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-neutral-light">
          <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <Home className="h-4 w-4 mr-1" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>Shopping Cart</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Page Title */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-heading text-3xl font-bold text-neutral-dark">
                Your Shopping Cart
              </h1>
              {cartItems.length > 0 && (
                <Button 
                  variant="outline" 
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              )}
            </div>
            
            {cartItems.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.type}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  ))}
                </div>
                
                {/* Cart Summary */}
                <div className="lg:col-span-1">
                  <CartSummary 
                    onProceedToCheckout={() => {
                      if (!user) {
                        setShowEmptyWarning(true);
                      }
                    }}
                  />
                  
                  {showEmptyWarning && !user && (
                    <motion.div
                      className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-amber-800 text-sm">
                          You need to be logged in to proceed to checkout.
                        </p>
                        <Link href="/auth">
                          <Button variant="link" className="p-0 h-auto text-amber-600 font-medium">
                            Login or Register
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex justify-center items-center w-20 h-20 bg-neutral-light rounded-full mb-6">
                  <ShoppingCart className="h-10 w-10 text-neutral-dark/50" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-neutral-dark mb-2">
                  Your Cart is Empty
                </h2>
                <p className="text-neutral-dark/70 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any items to your cart yet. 
                  Browse our products and start your delicious journey!
                </p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary-light">
                    Browse Products
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

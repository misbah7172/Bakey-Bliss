import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, CreditCard, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface CartSummaryProps {
  checkout?: boolean;
  onProceedToCheckout?: () => void;
}

export default function CartSummary({ checkout = false, onProceedToCheckout }: CartSummaryProps) {
  const [location, navigate] = useLocation();
  const { cartItems, totalPrice } = useCart();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate summary numbers
  const subtotal = totalPrice;
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  const total = subtotal + tax + shipping;
  
  // Item counts
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const handleProceedToCheckout = () => {
    if (onProceedToCheckout) {
      onProceedToCheckout();
    }
    
    if (user) {
      setIsLoading(true);
      setTimeout(() => {
        navigate('/checkout');
        setIsLoading(false);
      }, 500);
    }
  };
  
  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Order Summary
        </CardTitle>
        <CardDescription>
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-neutral-dark/70">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-dark/70">Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-dark/70">Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
        
        {/* Free shipping progress */}
        {!checkout && subtotal < 50 && (
          <div className="mt-4 bg-neutral-50 p-3 rounded-md text-sm">
            <p className="text-neutral-dark">
              Add {formatCurrency(50 - subtotal)} more to qualify for <span className="font-medium">FREE shipping</span>
            </p>
            <div className="mt-2 w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-success" 
                style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }} 
              />
            </div>
          </div>
        )}
        
        {/* Payment info for checkout page */}
        {checkout && (
          <div className="my-4 bg-secondary rounded-md p-4">
            <h3 className="font-medium mb-2 flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-primary" />
              Payment Information
            </h3>
            <p className="text-sm text-neutral-dark/70">
              Payment will be collected upon delivery. We accept cash, credit cards, and mobile payments.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {checkout ? (
          <div className="w-full text-center text-sm text-neutral-dark/70">
            By completing your order, you agree to our Terms of Service and Privacy Policy
          </div>
        ) : (
          <Button 
            onClick={handleProceedToCheckout}
            disabled={cartItems.length === 0 || isLoading}
            className="w-full bg-primary hover:bg-primary-light"
          >
            {isLoading ? 'Processing...' : (
              <>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

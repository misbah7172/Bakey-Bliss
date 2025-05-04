import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrency } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5, { message: 'Address is required' }),
  city: z.string().min(2, { message: 'City is required' }),
  zipCode: z.string().min(5, { message: 'Valid zip code is required' }),
  phone: z.string().min(10, { message: 'Valid phone number is required' }),
  specialInstructions: z.string().optional(),
  paymentMethod: z.enum(['credit_card', 'paypal']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [_, navigate] = useLocation();
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryAddress: '',
      city: '',
      zipCode: '',
      phone: '',
      specialInstructions: '',
      paymentMethod: 'credit_card',
    }
  });
  
  const createOrderMutation = useMutation({
    mutationFn: async (formData: CheckoutFormValues) => {
      // In a real app, this would include payment processing
      const orderData = {
        customer_id: user?.id,
        total_amount: totalPrice,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          product_id: item.type === 'product' ? item.id : null,
          type: item.type,
          customization: item.customization || null
        })),
        delivery_info: {
          address: formData.deliveryAddress,
          city: formData.city,
          zip_code: formData.zipCode,
          phone: formData.phone,
          special_instructions: formData.specialInstructions
        },
        payment_method: formData.paymentMethod
      };
      
      const res = await apiRequest('POST', '/api/orders', orderData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setOrderId(data.order.id);
      setOrderComplete(true);
      // Clear the cart after successful order
      clearCart();
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Add some items before checkout.",
        variant: "destructive",
      });
      return;
    }
    
    createOrderMutation.mutate(data);
  };
  
  // If no items in cart, redirect to cart page
  if (cartItems.length === 0 && !orderComplete) {
    navigate('/cart');
    return null;
  }
  
  if (orderComplete) {
    return (
      <>
        <Helmet>
          <title>Order Confirmation | BakeryBliss</title>
        </Helmet>
        
        <div className="min-h-screen flex flex-col">
          <Header />
          
          <main className="flex-1 bg-neutral-light flex items-center justify-center py-12">
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full mx-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-6">
                <div className="inline-flex justify-center items-center w-20 h-20 bg-success/10 rounded-full mb-4">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <h1 className="font-heading text-2xl font-bold text-neutral-dark">
                  Order Successfully Placed!
                </h1>
                <p className="text-neutral-dark/70 mt-2">
                  Thank you for your order. We've received your request and it's being processed.
                </p>
                {orderId && (
                  <p className="text-primary font-medium mt-4">
                    Order ID: #{orderId}
                  </p>
                )}
              </div>
              
              <div className="border-t border-b border-border py-6 my-6">
                <h2 className="font-medium text-neutral-dark mb-4">Order Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-dark/70">Total Items:</span>
                    <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-dark/70">Order Date:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-dark/70">Order Total:</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-light"
                  onClick={() => navigate('/dashboard/customer?tab=orders')}
                >
                  View Your Orders
                </Button>
              </div>
            </motion.div>
          </main>
          
          <Footer />
        </div>
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Checkout | BakeryBliss</title>
        <meta name="description" content="Complete your order and provide delivery details" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-neutral-light">
          <div className="container mx-auto px-4 py-8">
            <h1 className="font-heading text-3xl font-bold text-neutral-dark mb-8 text-center">
              Checkout
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <h2 className="font-heading text-xl font-bold text-neutral-dark mb-6">
                      Delivery Information
                    </h2>
                    
                    <div className="space-y-4 mb-8">
                      <div>
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Input 
                          id="deliveryAddress" 
                          {...register('deliveryAddress')} 
                          className="mt-1" 
                        />
                        {errors.deliveryAddress && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.deliveryAddress.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            {...register('city')}
                            className="mt-1" 
                          />
                          {errors.city && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.city.message}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input 
                            id="zipCode" 
                            {...register('zipCode')}
                            className="mt-1" 
                          />
                          {errors.zipCode && (
                            <p className="text-destructive text-sm mt-1">
                              {errors.zipCode.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          {...register('phone')}
                          className="mt-1" 
                        />
                        {errors.phone && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                        <Textarea 
                          id="specialInstructions" 
                          {...register('specialInstructions')}
                          placeholder="Delivery instructions, allergies, etc."
                          className="mt-1" 
                        />
                      </div>
                    </div>
                    
                    <h2 className="font-heading text-xl font-bold text-neutral-dark mb-6">
                      Payment Method
                    </h2>
                    
                    <div className="space-y-4 mb-8">
                      <RadioGroup defaultValue="credit_card" {...register('paymentMethod')}>
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="credit_card" id="credit_card" />
                          <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                            Credit Card
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                            PayPal
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.paymentMethod && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.paymentMethod.message}
                        </p>
                      )}
                      
                      <div className="mt-6">
                        <p className="text-sm text-neutral-dark/70 mb-2">
                          Note: This is a demo implementation. No actual payment will be processed.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary-light"
                      size="lg"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Complete Order'
                      )}
                    </Button>
                  </form>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <CartSummary checkout />
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

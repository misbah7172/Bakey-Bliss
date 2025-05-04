import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    type: 'product' | 'custom_cake' | 'custom_chocolate';
    customization?: Record<string, any>;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  
  const handleRemove = () => {
    setIsRemoving(true);
    // Delay actual removal to allow animation to complete
    setTimeout(() => {
      removeFromCart(item.id);
    }, 300);
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(item.id, newQuantity);
  };
  
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-sm overflow-hidden border border-border transition-all duration-300 ${
        isRemoving ? 'opacity-0 scale-95' : 'opacity-100'
      }`}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Product Image */}
        <div className="w-full sm:w-1/4 h-32 sm:h-auto flex-shrink-0">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Product Details */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-dark">
                {item.name}
              </h3>
              
              {item.type !== 'product' && (
                <div className="mt-1 inline-block px-2 py-1 bg-accent/10 text-accent rounded-full text-xs">
                  {item.type === 'custom_cake' ? 'Custom Cake' : 'Custom Chocolate'}
                </div>
              )}
            </div>
            <div className="font-bold text-primary">
              {formatCurrency(item.price)}
            </div>
          </div>
          
          {/* Customization details if available */}
          {item.customization && (
            <div className="my-2 text-sm text-neutral-dark/70 bg-neutral-50 p-2 rounded-md">
              {Object.entries(item.customization).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium capitalize mr-1">{key.replace('_', ' ')}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            {/* Quantity Controls */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleQuantityChange(item.quantity - 1)}
              >
                <MinusCircle className="h-4 w-4 text-neutral-dark/70" />
              </Button>
              <span className="mx-2 w-6 text-center">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                <PlusCircle className="h-4 w-4 text-neutral-dark/70" />
              </Button>
            </div>
            
            {/* Total and Remove */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-dark/70">
                Subtotal: <span className="font-bold text-neutral-dark">{formatCurrency(item.price * item.quantity)}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/80"
                onClick={handleRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

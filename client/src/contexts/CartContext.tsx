import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  type: 'product' | 'custom_cake' | 'custom_chocolate';
  customization?: Record<string, any>;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('bakerybliss-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bakerybliss-cart', JSON.stringify(cartItems));
  }, [cartItems]);
  
  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      // For custom items, always add as a new item
      if (item.type === 'custom_cake' || item.type === 'custom_chocolate') {
        const newItem = { ...item, quantity: 1 };
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart.`,
        });
        return [...prevItems, newItem];
      }
      
      // For regular products, check if it already exists
      const existingItemIndex = prevItems.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.type === 'product'
      );
      
      if (existingItemIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        
        toast({
          title: "Updated cart",
          description: `Increased ${item.name} quantity.`,
        });
        
        return newItems;
      } else {
        const newItem = { ...item, quantity: 1 };
        
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart.`,
        });
        
        return [...prevItems, newItem];
      }
    });
  };
  
  const removeFromCart = (id: number) => {
    setCartItems(prevItems => {
      const removedItem = prevItems.find(item => item.id === id);
      const newItems = prevItems.filter(item => item.id !== id);
      
      if (removedItem) {
        toast({
          title: "Removed from cart",
          description: `${removedItem.name} has been removed from your cart.`,
        });
      }
      
      return newItems;
    });
  };
  
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };
  
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

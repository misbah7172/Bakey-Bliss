import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  is_featured: boolean;
  is_new: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'product'
    });
  };
  
  return (
    <motion.div 
      className="product-card bg-white rounded-lg overflow-hidden shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-48 object-cover cursor-pointer"
          />
        </Link>
        {product.is_new && (
          <Badge className="absolute top-2 right-2 bg-success text-white">New</Badge>
        )}
        {!product.is_new && product.is_featured && (
          <Badge className="absolute top-2 right-2 bg-accent text-white">Best Seller</Badge>
        )}
      </div>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-heading text-lg font-bold text-neutral-dark mb-1 cursor-pointer hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-neutral-dark/70 text-sm mb-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
          <Button 
            onClick={handleAddToCart} 
            size="icon"
            className="bg-primary hover:bg-primary-light text-white rounded-full w-8 h-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

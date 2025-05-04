import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: number;
  is_featured: boolean;
  is_new: boolean;
}

export default function FeaturedProducts() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
  });
  
  const { addToCart } = useCart();
  
  const displayProducts = isLoading 
    ? Array(4).fill(null) 
    : products?.slice(0, 4) || [];
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'product'
    });
  };
  
  return (
    <section className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
            Featured Products
          </h2>
          <p className="text-neutral-dark/80 max-w-2xl mx-auto">
            Our most popular handcrafted creations loved by our customers
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <motion.div 
              key={product?.id || index}
              className="product-card bg-white rounded-lg overflow-hidden shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {isLoading ? (
                <>
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                        onClick={() => handleAddToCart(product)} 
                        size="icon"
                        className="bg-primary hover:bg-primary-light text-white rounded-full w-8 h-8"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/products">
            <Button className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-6 rounded-full shadow-md">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

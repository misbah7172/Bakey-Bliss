import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from './ProductCard';

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

interface ProductGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
}

export default function ProductGrid({ products, isLoading }: ProductGridProps) {
  // Create empty product placeholders when loading
  const skeletons = Array(8).fill(null);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {isLoading 
        ? skeletons.map((_, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
              <Skeleton className="w-full h-48" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          ))
        : products?.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
      
      {/* Empty state */}
      {!isLoading && products?.length === 0 && (
        <div className="col-span-full text-center py-16">
          <h3 className="font-heading text-xl text-neutral-dark mb-2">No products found</h3>
          <p className="text-neutral-dark/70">Try adjusting your filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { getCategoryImage } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface Category {
  id: number;
  name: string;
}

export default function CategorySection() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const displayCategories = isLoading 
    ? Array(4).fill(null) 
    : categories?.slice(0, 4) || [];
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
            Explore Our Categories
          </h2>
          <p className="text-neutral-dark/80 max-w-2xl mx-auto">
            Discover our wide range of freshly baked goods crafted with premium ingredients
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => (
            <motion.div 
              key={category?.id || index}
              className="category-card relative rounded-lg overflow-hidden shadow-md h-64 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                  <div>
                    <img 
                      src={getCategoryImage(category.name)} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="category-overlay absolute inset-0 bg-primary-dark opacity-70 flex items-center justify-center transition-opacity duration-300">
                      <h3 className="font-heading text-xl text-white font-bold">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/products">
            <button className="inline-block bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-2 px-6 rounded-full transition duration-300">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

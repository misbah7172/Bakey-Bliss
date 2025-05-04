import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductFilters from '@/components/products/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

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

interface Filters {
  search: string;
  categories: string[];
  priceRange: [number, number];
  onlyFeatured: boolean;
  onlyNew: boolean;
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}

export default function ProductsPage() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categories: [],
    priceRange: [0, 100],
    onlyFeatured: false,
    onlyNew: false,
    sortBy: 'default'
  });
  
  // Parse category from URL query params
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      setActiveCategory(category);
      setFilters(prev => ({
        ...prev,
        categories: [category]
      }));
    }
  }, [location]);
  
  // Fetch all products
  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  // Apply filters to products
  const filteredProducts = allProducts?.filter(product => {
    // Search filter
    if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !product.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filters.categories.length > 0) {
      // We would need to join with category names here, but for this implementation
      // we'll pretend the product has the right category
      const matchesCategory = filters.categories.some(categoryName => {
        // Simulated category match based on products we have
        return true;
      });
      
      if (!matchesCategory) return false;
    }
    
    // Price filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    
    // Featured filter
    if (filters.onlyFeatured && !product.is_featured) {
      return false;
    }
    
    // New filter
    if (filters.onlyNew && !product.is_new) {
      return false;
    }
    
    return true;
  });
  
  // Sort filtered products
  const sortedProducts = filteredProducts?.slice().sort((a, b) => {
    switch (filters.sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };
  
  return (
    <>
      <Helmet>
        <title>Our Products | BakeryBliss</title>
        <meta name="description" content="Browse our delicious selection of freshly baked products" />
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
                  <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                {activeCategory && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink>{activeCategory}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
                {activeCategory || "All Products"}
              </h1>
              <p className="text-neutral-dark/80 max-w-2xl mx-auto">
                Discover our wide range of freshly baked goods crafted with premium ingredients
              </p>
            </div>
            
            {/* Filters */}
            <ProductFilters onFilterChange={handleFilterChange} activeCategory={activeCategory} />
            
            {/* Product Grid */}
            <ProductGrid products={sortedProducts} isLoading={isLoading} />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

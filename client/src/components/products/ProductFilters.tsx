import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatCurrency } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  onFilterChange: (filters: Filters) => void;
  activeCategory?: string;
}

interface Filters {
  search: string;
  categories: string[];
  priceRange: [number, number];
  onlyFeatured: boolean;
  onlyNew: boolean;
  sortBy: 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}

export default function ProductFilters({ onFilterChange, activeCategory }: ProductFiltersProps) {
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    categories: activeCategory ? [activeCategory] : [],
    priceRange: [0, 100],
    onlyFeatured: false,
    onlyNew: false,
    sortBy: 'default'
  });
  
  // Set active category when it changes
  useEffect(() => {
    if (activeCategory) {
      setFilters(prev => ({
        ...prev,
        categories: [activeCategory]
      }));
    }
  }, [activeCategory]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };
  
  const handleCategoryChange = (category: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      
      return { ...prev, categories: newCategories };
    });
  };
  
  const handlePriceChange = (value: number[]) => {
    setFilters({ ...filters, priceRange: [value[0], value[1]] });
  };
  
  const handleSortChange = (sortBy: Filters['sortBy']) => {
    setFilters({ ...filters, sortBy });
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      priceRange: [0, 100],
      onlyFeatured: false,
      onlyNew: false,
      sortBy: 'default'
    });
  };
  
  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    filters.categories.length +
    (filters.onlyFeatured ? 1 : 0) +
    (filters.onlyNew ? 1 : 0) +
    (filters.sortBy !== 'default' ? 1 : 0) +
    ((filters.priceRange[0] > 0 || filters.priceRange[1] < 100) ? 1 : 0);
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/50 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
          {filters.search && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/70 hover:text-neutral-dark"
              onClick={() => setFilters({ ...filters, search: '' })}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Sort Dropdown */}
        <div className="min-w-[200px]">
          <div className="flex items-center gap-2 border rounded-md p-2 cursor-pointer bg-white">
            <SlidersHorizontal className="h-4 w-4 text-neutral-dark/70" />
            <select 
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0"
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as Filters['sortBy'])}
            >
              <option value="default">Sort by: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>
        </div>
        
        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="md:hidden w-full flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Products</SheetTitle>
              <SheetDescription>
                Refine your product search with these filters
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="text-lg font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories?.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`category-mobile-${category.id}`}
                        checked={filters.categories.includes(category.name)}
                        onCheckedChange={() => handleCategoryChange(category.name)}
                      />
                      <Label htmlFor={`category-mobile-${category.id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Range */}
              <div>
                <h3 className="text-lg font-medium mb-2">Price Range</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={[0, 100]}
                    value={filters.priceRange}
                    max={100}
                    step={1}
                    onValueChange={handlePriceChange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-neutral-dark/70">
                    <span>{formatCurrency(filters.priceRange[0])}</span>
                    <span>{formatCurrency(filters.priceRange[1])}</span>
                  </div>
                </div>
              </div>
              
              {/* Product Attributes */}
              <div>
                <h3 className="text-lg font-medium mb-2">Product Attributes</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured-mobile"
                      checked={filters.onlyFeatured}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, onlyFeatured: checked as boolean })
                      }
                    />
                    <Label htmlFor="featured-mobile">Featured Products</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new-mobile"
                      checked={filters.onlyNew}
                      onCheckedChange={(checked) => 
                        setFilters({ ...filters, onlyNew: checked as boolean })
                      }
                    />
                    <Label htmlFor="new-mobile">New Arrivals</Label>
                  </div>
                </div>
              </div>
              
              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-4 items-center">
        {/* Filter by Categories */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Categories
            <ChevronDown className="h-4 w-4" />
            {filters.categories.length > 0 && (
              <span className="ml-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {filters.categories.length}
              </span>
            )}
          </Button>
          <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-10 hidden group-focus-within:block">
            <div className="space-y-2">
              {categories?.map(category => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category.id}`}
                    checked={filters.categories.includes(category.name)}
                    onCheckedChange={() => handleCategoryChange(category.name)}
                  />
                  <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Filter by Attributes */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="featured"
              checked={filters.onlyFeatured}
              onCheckedChange={(checked) => 
                setFilters({ ...filters, onlyFeatured: checked as boolean })
              }
            />
            <Label htmlFor="featured">Featured</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="new"
              checked={filters.onlyNew}
              onCheckedChange={(checked) => 
                setFilters({ ...filters, onlyNew: checked as boolean })
              }
            />
            <Label htmlFor="new">New Arrivals</Label>
          </div>
        </div>
        
        {/* Price Range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-dark/70 whitespace-nowrap">
            Price: {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
          </span>
          <Slider
            defaultValue={[0, 100]}
            value={filters.priceRange}
            max={100}
            step={1}
            onValueChange={handlePriceChange}
            className="w-40"
          />
        </div>
        
        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearFilters} className="ml-auto">
            Clear Filters
          </Button>
        )}
      </div>
      
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.search && (
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Search: "{filters.search}"
              <button onClick={() => setFilters({ ...filters, search: '' })}>
                <X className="h-3 w-3 text-neutral-dark/70" />
              </button>
            </div>
          )}
          
          {filters.categories.map(category => (
            <div key={category} className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              {category}
              <button onClick={() => handleCategoryChange(category)}>
                <X className="h-3 w-3 text-neutral-dark/70" />
              </button>
            </div>
          ))}
          
          {filters.onlyFeatured && (
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Featured
              <button onClick={() => setFilters({ ...filters, onlyFeatured: false })}>
                <X className="h-3 w-3 text-neutral-dark/70" />
              </button>
            </div>
          )}
          
          {filters.onlyNew && (
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              New Arrivals
              <button onClick={() => setFilters({ ...filters, onlyNew: false })}>
                <X className="h-3 w-3 text-neutral-dark/70" />
              </button>
            </div>
          )}
          
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 100) && (
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Price: {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
              <button onClick={() => setFilters({ ...filters, priceRange: [0, 100] })}>
                <X className="h-3 w-3 text-neutral-dark/70" />
              </button>
            </div>
          )}
          
          {filters.sortBy !== 'default' && (
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center gap-1">
              Sort: {filters.sortBy.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
              <button onClick={() => setFilters({ ...filters, sortBy: 'default' })}>
                <X className="h-3 w-3 text-neutral-dark/70" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

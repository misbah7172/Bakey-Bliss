import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home, Plus, Minus, ShoppingBag, Heart, Share2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function ProductDetail() {
  const [match, params] = useRoute('/products/:id');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  
  const productId = params?.id ? parseInt(params.id) : 0;
  
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });
  
  const { data: relatedProducts, isLoading: isLoadingRelated } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!product?.category_id,
  });
  
  const handleAddToCart = () => {
    if (product) {
      // Add the selected quantity to cart
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          type: 'product'
        });
      }
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };
  
  if (!match) {
    return null;
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-neutral-light flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-dark mb-2">Product Not Found</h1>
            <p className="text-neutral-dark/70 mb-4">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const filteredRelatedProducts = relatedProducts
    ?.filter(p => p.id !== productId)
    ?.slice(0, 4);
  
  return (
    <>
      <Helmet>
        <title>{isLoading ? 'Product Details' : `${product?.name} | BakeryBliss`}</title>
        <meta name="description" content={product?.description || 'Product details'} />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 bg-neutral-light py-8">
          <div className="container mx-auto px-4">
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
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink>
                    {isLoading ? <Skeleton className="w-20 h-4" /> : product?.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Product Detail Content */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                {/* Product Image */}
                <div className="relative">
                  {isLoading ? (
                    <Skeleton className="w-full aspect-square rounded-lg" />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={product?.image} 
                        alt={product?.name} 
                        className="w-full rounded-lg object-cover aspect-square"
                      />
                      {product?.is_new && (
                        <Badge className="absolute top-4 left-4 bg-success text-white">New</Badge>
                      )}
                      {!product?.is_new && product?.is_featured && (
                        <Badge className="absolute top-4 left-4 bg-accent text-white">Best Seller</Badge>
                      )}
                    </motion.div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className="flex flex-col">
                  {isLoading ? (
                    <>
                      <Skeleton className="w-3/4 h-8 mb-2" />
                      <Skeleton className="w-1/4 h-6 mb-4" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-3/4 h-4 mb-6" />
                      <div className="mt-auto">
                        <Skeleton className="w-full h-12 mb-4" />
                        <Skeleton className="w-full h-12" />
                      </div>
                    </>
                  ) : (
                    <>
                      <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-dark mb-2">
                        {product?.name}
                      </h1>
                      <div className="text-xl font-bold text-primary mb-4">
                        {formatCurrency(product?.price || 0)}
                      </div>
                      <p className="text-neutral-dark/80 mb-6">
                        {product?.description}
                      </p>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center mb-6">
                        <span className="mr-4 text-neutral-dark">Quantity:</span>
                        <div className="flex items-center border border-border rounded-md">
                          <button 
                            onClick={decreaseQuantity}
                            className="px-3 py-2 text-neutral-dark hover:text-primary"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-4 py-2 border-x border-border">{quantity}</span>
                          <button 
                            onClick={increaseQuantity}
                            className="px-3 py-2 text-neutral-dark hover:text-primary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                        <Button 
                          className="flex-1 bg-primary hover:bg-primary-light"
                          size="lg"
                          onClick={handleAddToCart}
                        >
                          <ShoppingBag className="mr-2 h-5 w-5" />
                          Add to Cart
                        </Button>
                        <div className="flex gap-4">
                          <Button variant="outline" size="icon" className="h-12 w-12">
                            <Heart className="h-5 w-5" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-12 w-12">
                            <Share2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Product Tabs */}
              {!isLoading && (
                <Tabs defaultValue="description" className="p-6 pt-0 border-t border-border mt-6">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="text-neutral-dark/80">
                    <p className="mb-4">
                      {product?.description}
                    </p>
                    <p>
                      Our {product?.name} is made fresh daily using traditional recipes and techniques. 
                      Each item is handcrafted with care by our skilled bakers to ensure the highest quality.
                    </p>
                  </TabsContent>
                  <TabsContent value="ingredients" className="text-neutral-dark/80">
                    <p className="mb-4">All of our products are made with premium ingredients:</p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Organic flour</li>
                      <li>Free-range eggs</li>
                      <li>Locally sourced dairy</li>
                      <li>Natural sweeteners</li>
                      <li>No artificial preservatives</li>
                    </ul>
                    <p className="mt-4 text-sm text-neutral-dark/60">
                      Please note: Our kitchen handles nuts, wheat, dairy, and eggs. 
                      Contact us for detailed allergen information.
                    </p>
                  </TabsContent>
                  <TabsContent value="reviews" className="text-neutral-dark/80">
                    <div className="text-center py-8">
                      <p className="mb-4">No reviews yet for this product.</p>
                      <p>Be the first to share your experience!</p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
            
            {/* Related Products */}
            <div className="mt-12">
              <h2 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
                You May Also Like
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoadingRelated ? (
                  Array(4).fill(null).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-0">
                        <Skeleton className="w-full h-48" />
                        <div className="p-4">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredRelatedProducts?.map((relatedProduct, index) => (
                    <Card key={relatedProduct.id} className="overflow-hidden product-card">
                      <CardContent className="p-0">
                        <Link href={`/products/${relatedProduct.id}`}>
                          <img 
                            src={relatedProduct.image} 
                            alt={relatedProduct.name} 
                            className="w-full h-48 object-cover cursor-pointer"
                          />
                        </Link>
                        <div className="p-4">
                          <Link href={`/products/${relatedProduct.id}`}>
                            <h3 className="font-heading text-lg font-bold text-neutral-dark mb-1 cursor-pointer hover:text-primary transition-colors">
                              {relatedProduct.name}
                            </h3>
                          </Link>
                          <p className="text-neutral-dark/70 text-sm mb-2">{relatedProduct.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary">{formatCurrency(relatedProduct.price)}</span>
                            <Button 
                              onClick={() => {
                                addToCart({
                                  id: relatedProduct.id,
                                  name: relatedProduct.name,
                                  price: relatedProduct.price,
                                  image: relatedProduct.image,
                                  type: 'product'
                                });
                              }}
                              size="icon"
                              className="bg-primary hover:bg-primary-light text-white rounded-full w-8 h-8"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

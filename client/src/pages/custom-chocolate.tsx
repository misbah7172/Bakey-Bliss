import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChocolateCustomizer from '@/components/custom/ChocolateCustomizer';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

export default function CustomChocolatePage() {
  return (
    <>
      <Helmet>
        <title>Custom Chocolate Builder | BakeryBliss</title>
        <meta name="description" content="Create your perfect custom chocolates with our chocolate customizer" />
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
                  <BreadcrumbLink>Custom Chocolate Builder</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
                Custom Chocolate Builder
              </h1>
              <p className="text-neutral-dark/80 max-w-2xl mx-auto">
                Create your perfect chocolates with our customizer - choose shapes, flavors, fillings, and more
              </p>
            </div>
            
            {/* Chocolate Customizer */}
            <ChocolateCustomizer />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

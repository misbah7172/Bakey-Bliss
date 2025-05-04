import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CakeCustomizer from '@/components/custom/CakeCustomizer';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

export default function CustomCakePage() {
  return (
    <>
      <Helmet>
        <title>Custom Cake Builder | BakeryBliss</title>
        <meta name="description" content="Design your perfect custom cake with our easy-to-use cake builder" />
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
                  <BreadcrumbLink>Custom Cake Builder</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            {/* Page Title */}
            <div className="text-center mb-8">
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
                Custom Cake Builder
              </h1>
              <p className="text-neutral-dark/80 max-w-2xl mx-auto">
                Design your dream cake with our easy-to-use cake customizer
              </p>
            </div>
            
            {/* Cake Customizer */}
            <CakeCustomizer />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}

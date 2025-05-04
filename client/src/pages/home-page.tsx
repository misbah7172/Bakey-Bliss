import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BecomeABakerCTA from '@/components/home/BecomeABakerCTA';
import CakeCustomizer from '@/components/custom/CakeCustomizer';
import { Helmet } from 'react-helmet';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>BakeryBliss - Artisanal Bakery</title>
        <meta name="description" content="Handcrafted baked goods made with premium ingredients and traditional techniques" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <HeroSection />
          <CategorySection />
          <FeaturedProducts />
          
          {/* Custom Cake Builder Section */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
                  Custom Cake Builder
                </h2>
                <p className="text-neutral-dark/80 max-w-2xl mx-auto">
                  Design your dream cake with our easy-to-use cake customizer
                </p>
              </div>
              
              <CakeCustomizer preview />
            </div>
          </section>
          
          <TestimonialsSection />
          <BecomeABakerCTA />
        </main>
        
        <Footer />
      </div>
    </>
  );
}

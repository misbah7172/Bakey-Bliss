import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="hero-section h-[500px] flex items-center justify-center text-center text-white">
      <div className="container mx-auto px-4">
        <motion.h1 
          className="font-heading text-4xl md:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Artisanal Baking at Its Finest
        </motion.h1>
        
        <motion.p 
          className="text-lg md:text-xl mb-8 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Handcrafted with love using premium ingredients and traditional techniques
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/products">
            <Button 
              className="bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-full shadow-lg"
              size="lg"
            >
              Shop Now
            </Button>
          </Link>
          <Link href="/custom-cake">
            <Button 
              variant="outline" 
              className="bg-white text-primary hover:bg-secondary font-bold py-3 px-6 rounded-full shadow-lg border-white" 
              size="lg"
            >
              Custom Orders
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

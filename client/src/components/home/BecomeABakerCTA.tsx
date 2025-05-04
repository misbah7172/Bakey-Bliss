import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BecomeABakerCTA() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-xl overflow-hidden shadow-xl">
          <div className="flex flex-col md:flex-row">
            <motion.div 
              className="md:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                alt="Become a Baker" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="font-heading text-3xl font-bold text-white mb-4">
                Join Our Baking Team
              </h2>
              <p className="text-white/90 mb-6">
                Passionate about baking? Apply to become a Junior Baker and start your journey with BakeryBliss. 
                Learn from experienced bakers and share your creations with our customers.
              </p>
              
              <ul className="text-white/90 mb-6 space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 text-accent h-5 w-5" />
                  <span>Learn professional baking techniques</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-accent h-5 w-5" />
                  <span>Flexible working hours</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-accent h-5 w-5" />
                  <span>Opportunity for career growth</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 text-accent h-5 w-5" />
                  <span>Be part of a creative community</span>
                </li>
              </ul>
              
              <Link href="/auth?tab=baker-application">
                <Button 
                  className="bg-white text-primary hover:bg-neutral-light font-bold py-3 px-6 rounded-full shadow-md self-start"
                  size="lg"
                >
                  Apply Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

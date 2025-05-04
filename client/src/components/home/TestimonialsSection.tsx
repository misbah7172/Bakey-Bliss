import { motion } from 'framer-motion';
import { Star, StarHalf } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Custom Cake Order",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 5,
    content: "The custom birthday cake for my daughter was absolutely perfect! Everyone at the party was amazed by both the design and taste. Will definitely order again!"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Bread Enthusiast",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 5,
    content: "Their sourdough bread is the best I've ever had! The crust is perfectly crispy and the inside is so soft. I'm now a regular customer and can't imagine going anywhere else."
  },
  {
    id: 3,
    name: "Jennifer Chen",
    role: "Corporate Client",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    rating: 4.5,
    content: "I ordered custom chocolates as corporate gifts and BakeryBliss exceeded my expectations. The attention to detail and quality of the chocolates impressed all our clients."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-neutral-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-neutral-dark mb-2">
            Customer Testimonials
          </h2>
          <p className="text-neutral-dark/80 max-w-2xl mx-auto">
            See what our customers say about our artisanal creations
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.id}
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4 text-accent">
                {/* Render full stars */}
                {Array.from({ length: Math.floor(testimonial.rating) }).map((_, i) => (
                  <Star key={i} className="fill-current" size={16} />
                ))}
                
                {/* Render half star if needed */}
                {testimonial.rating % 1 !== 0 && (
                  <StarHalf className="fill-current" size={16} />
                )}
              </div>
              
              <p className="text-neutral-dark/80 mb-4">{testimonial.content}</p>
              
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <h4 className="font-bold text-neutral-dark">{testimonial.name}</h4>
                  <p className="text-xs text-neutral-dark/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

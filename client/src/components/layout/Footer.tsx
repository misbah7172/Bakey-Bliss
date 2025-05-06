import { Link } from 'wouter';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  return (
    <footer className="bg-neutral-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 40 40" 
                className="text-white"
                fill="currentColor"
              >
                <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20s20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16s-7.163 16-16 16z"/>
                <path d="M20 8c-3.314 0-6 2.686-6 6v10c0 3.314 2.686 6 6 6c3.314 0 6-2.686 6-6V14c0-3.314-2.686-6-6-6zm2 16c0 1.105-.895 2-2 2s-2-.895-2-2v-6h4v6zm0-10h-4v-1c0-1.105.895-2 2-2s2 .895 2 2v1z"/>
              </svg>
              <span className="font-accent text-2xl text-white">BakeryBliss</span>
            </div>
            <p className="text-white/70 mb-4">
              Handcrafted baked goods made with premium ingredients and traditional techniques since 2010.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-accent transition duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-accent transition duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-accent transition duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-accent transition duration-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/70 hover:text-accent transition duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-white/70 hover:text-accent transition duration-300">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/custom-cake" className="text-white/70 hover:text-accent transition duration-300">
                  Custom Cake
                </Link>
              </li>
              <li>
                <Link href="/custom-chocolate" className="text-white/70 hover:text-accent transition duration-300">
                  Custom Chocolates
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-white/70 hover:text-accent transition duration-300">
                  Cart
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-white/70 hover:text-accent transition duration-300">
                  Baker Application
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Categories */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=Bread & Loaves" className="text-white/70 hover:text-accent transition duration-300">
                  Breads & Loaves
                </Link>
              </li>
              <li>
                <Link href="/products?category=Cakes & Pastries" className="text-white/70 hover:text-accent transition duration-300">
                  Cakes & Pastries
                </Link>
              </li>
              <li>
                <Link href="/products?category=Cookies & Biscuits" className="text-white/70 hover:text-accent transition duration-300">
                  Cookies & Biscuits
                </Link>
              </li>
              <li>
                <Link href="/products?category=Pies & Tarts" className="text-white/70 hover:text-accent transition duration-300">
                  Pies & Tarts
                </Link>
              </li>
              <li>
                <Link href="/products?category=Custom Chocolates" className="text-white/70 hover:text-accent transition duration-300">
                  Custom Chocolates
                </Link>
              </li>
              <li>
                <Link href="/products?category=Seasonal & Special Items" className="text-white/70 hover:text-accent transition duration-300">
                  Seasonal Items
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact */}
          <div>
            <h3 className="font-heading text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 text-accent h-5 w-5" />
                <span className="text-white/70">123 Bakery Street, Flourville, CA 90210</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 text-accent h-5 w-5" />
                <span className="text-white/70">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 text-accent h-5 w-5" />
                <span className="text-white/70">info@bakerybliss.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="mr-3 text-accent h-5 w-5" />
                <span className="text-white/70">Mon-Sat: 7AM-7PM, Sun: 8AM-5PM</span>
              </li>
            </ul>
            <div className="mt-4">
              <form onSubmit={(e) => e.preventDefault()} className="flex">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="rounded-r-none bg-white text-neutral-dark focus-visible:ring-accent"
                />
                <Button type="submit" className="rounded-l-none bg-accent hover:bg-accent/80">
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/60 text-sm">
          <p>&copy; {new Date().getFullYear()} BakeryBliss. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

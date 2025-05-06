import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown,
  User,
  LogOut,
  Settings,
  Package,
  MessageCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleRedirectMap } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const { unreadCount } = useChat();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getDashboardLink = () => {
    if (!user) return '/auth';
    
    return roleRedirectMap[user.role] || '/dashboard/customer';
  };
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 40 40" 
                className="text-primary"
                fill="currentColor"
              >
                <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20s20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16s-7.163 16-16 16z"/>
                <path d="M20 8c-3.314 0-6 2.686-6 6v10c0 3.314 2.686 6 6 6c3.314 0 6-2.686 6-6V14c0-3.314-2.686-6-6-6zm2 16c0 1.105-.895 2-2 2s-2-.895-2-2v-6h4v6zm0-10h-4v-1c0-1.105.895-2 2-2s2 .895 2 2v1z"/>
              </svg>
              <span className="font-accent text-2xl text-primary">BakeryBliss</span>
            </div>
          </Link>
          
          {/* Navigation Menu - Desktop */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={`text-neutral-dark hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}>
              Home
            </Link>
            <Link href="/products" className={`text-neutral-dark hover:text-primary font-medium ${location === '/products' ? 'text-primary' : ''}`}>
              Products
            </Link>
            <Link href="/custom-cake" className={`text-neutral-dark hover:text-primary font-medium ${location === '/custom-cake' ? 'text-primary' : ''}`}>
              Custom Cake
            </Link>
            <Link href="/custom-chocolate" className={`text-neutral-dark hover:text-primary font-medium ${location === '/custom-chocolate' ? 'text-primary' : ''}`}>
              Custom Chocolates
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Shopping Cart */}
            <Link href="/cart">
              <div className="relative cursor-pointer">
                <ShoppingCart className="text-neutral-dark hover:text-primary h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>
            
            {/* Not Logged In */}
            {!user && (
              <Link href="/auth">
                <Button variant="ghost" className="text-neutral-dark hover:text-primary">
                  Login
                </Button>
              </Link>
            )}
            
            {/* Logged In */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-neutral-dark">{user.username}</span>
                    <ChevronDown className="h-4 w-4 text-neutral-dark" />
                    
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={getDashboardLink()}>
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`${getDashboardLink()}?tab=orders`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`${getDashboardLink()}?tab=messages`}>
                    <DropdownMenuItem className="cursor-pointer relative">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  <Link href={`${getDashboardLink()}?tab=settings`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-neutral-dark" />
              ) : (
                <Menu className="h-6 w-6 text-neutral-dark" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={`text-neutral-dark hover:text-primary font-medium ${location === '/' ? 'text-primary' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/products" 
                className={`text-neutral-dark hover:text-primary font-medium ${location === '/products' ? 'text-primary' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/custom-cake" 
                className={`text-neutral-dark hover:text-primary font-medium ${location === '/custom-cake' ? 'text-primary' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Custom Cake
              </Link>
              <Link 
                href="/custom-chocolate" 
                className={`text-neutral-dark hover:text-primary font-medium ${location === '/custom-chocolate' ? 'text-primary' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Custom Chocolates
              </Link>
              {user && (
                <Link 
                  href={getDashboardLink()}
                  className="text-neutral-dark hover:text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {!user && (
                <Link 
                  href="/auth"
                  className="text-neutral-dark hover:text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              )}
              {user && (
                <button 
                  className="text-destructive hover:text-destructive/80 font-medium cursor-pointer"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

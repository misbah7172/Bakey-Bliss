import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import Header from './Header';
import Footer from './Footer';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  Users, 
  Award, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Package,
  UserCog,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { unreadCount } = useChat();
  const [collapsed, setCollapsed] = useState(false);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-light">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
          <Link href="/auth">
            <Button>Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Determine sidebar items based on user role
  const sidebarItems = (() => {
    const commonItems = [
      { label: 'Dashboard', icon: LayoutDashboard, href: '', tab: 'dashboard' },
      { label: 'My Orders', icon: Package, href: '?tab=orders', tab: 'orders' },
      { label: 'Messages', icon: MessageSquare, href: '?tab=messages', tab: 'messages', count: unreadCount },
      { label: 'Settings', icon: Settings, href: '?tab=settings', tab: 'settings' },
    ];
    
    switch (user.role) {
      case 'admin':
        return [
          ...commonItems,
          { label: 'Manage Users', icon: Users, href: '?tab=users', tab: 'users' },
          { label: 'Manage Products', icon: ShoppingBag, href: '?tab=products', tab: 'products' },
          { label: 'Applications', icon: FileText, href: '?tab=applications', tab: 'applications' },
        ];
      case 'main_baker':
        return [
          ...commonItems,
          { label: 'Assign Orders', icon: Package, href: '?tab=assign', tab: 'assign' },
          { label: 'Junior Bakers', icon: Users, href: '?tab=bakers', tab: 'bakers' },
        ];
      case 'junior_baker':
        return [
          ...commonItems,
          { label: 'My Assignments', icon: Package, href: '?tab=assignments', tab: 'assignments' },
          { label: 'Promotion', icon: Award, href: '?tab=promotion', tab: 'promotion' },
        ];
      case 'customer':
      default:
        return [
          ...commonItems,
          { label: 'Become a Baker', icon: Award, href: '?tab=baker-application', tab: 'baker-application' },
        ];
    }
  })();
  
  const basePath = (() => {
    if (location.startsWith('/dashboard/admin')) return '/dashboard/admin';
    if (location.startsWith('/dashboard/main-baker')) return '/dashboard/main-baker';
    if (location.startsWith('/dashboard/junior-baker')) return '/dashboard/junior-baker';
    return '/dashboard/customer';
  })();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside 
          className={cn(
            "bg-white border-r border-border h-[calc(100vh-64px)] sticky top-16 transition-all duration-300",
            collapsed ? "w-[72px]" : "w-64"
          )}
        >
          <div className="p-4 flex justify-between items-center border-b border-border">
            <div className={cn("flex items-center gap-2", collapsed && "hidden")}>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-sm text-neutral-dark">{user.username}</span>
                <span className="text-xs text-neutral-dark/60 capitalize">{user.role.replace('_', ' ')}</span>
              </div>
            </div>
            <Button
              variant="ghost" 
              size="icon" 
              onClick={() => setCollapsed(!collapsed)}
              className="text-neutral-dark hover:text-primary"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>
          </div>
          
          <nav className="p-2">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.tab}>
                  <Link href={`${basePath}${item.href}`}>
                    <a 
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md text-neutral-dark hover:bg-primary/10 hover:text-primary transition-colors",
                        (activeTab === item.tab || (!activeTab && item.tab === 'dashboard')) && 
                          "bg-primary/10 text-primary"
                      )}
                    >
                      <item.icon size={20} />
                      <span className={cn("text-sm", collapsed && "hidden")}>
                        {item.label}
                      </span>
                      {item.count && item.count > 0 && (
                        <Badge variant="destructive" className={cn("ml-auto", collapsed && "hidden")}>
                          {item.count}
                        </Badge>
                      )}
                    </a>
                  </Link>
                </li>
              ))}
              
              <li className="pt-4 mt-4 border-t border-border">
                <button 
                  onClick={() => logoutMutation.mutate()} 
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-destructive hover:bg-destructive/10 w-full transition-colors",
                  )}
                >
                  <LogOut size={20} />
                  <span className={cn("text-sm", collapsed && "hidden")}>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 bg-neutral-light",
          collapsed ? "ml-[72px]" : "ml-64"
        )}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

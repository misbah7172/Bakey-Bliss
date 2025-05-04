import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrdersList from '@/components/dashboard/OrdersList';
import ChatInterface from '@/components/dashboard/ChatInterface';
import BakerApplication from '@/components/dashboard/BakerApplication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Package, PackageCheck, Clock, BarChart3, ShoppingBag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function CustomerDashboard() {
  const [_, params] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });
  
  const { data: applications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['/api/baker-applications'],
    enabled: !!user,
  });
  
  // Set active tab from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [params]);
  
  // Calculate dashboard stats
  const pendingOrders = orders?.filter(order => ['pending', 'assigned', 'in_progress'].includes(order.status)).length || 0;
  const completedOrders = orders?.filter(order => ['completed', 'ready_for_delivery', 'delivered'].includes(order.status)).length || 0;
  const hasPendingApplication = applications?.some((app: any) => app.status === 'pending');
  
  return (
    <>
      <Helmet>
        <title>Customer Dashboard | BakeryBliss</title>
      </Helmet>
      
      <DashboardLayout activeTab={activeTab}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-5 w-full max-w-xl">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="baker-application">Become a Baker</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark">
              Welcome, {user?.username}!
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Pending Orders Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{pendingOrders}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders being processed
                  </p>
                </CardContent>
              </Card>
              
              {/* Completed Orders Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                  <PackageCheck className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{completedOrders}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders completed & delivered
                  </p>
                </CardContent>
              </Card>
              
              {/* Baker Application Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Baker Status</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {isLoadingApplications ? (
                    <Skeleton className="h-8 w-full" />
                  ) : hasPendingApplication ? (
                    <div className="text-sm font-medium text-amber-600">Application Pending</div>
                  ) : (
                    <div className="text-sm font-medium">No Active Application</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {hasPendingApplication 
                      ? "Your application is being reviewed" 
                      : "Apply to become a baker"}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>
                  Your most recent orders and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {Array(3).fill(null).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Order #{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-success/20 text-success' :
                          order.status === 'ready_for_delivery' ? 'bg-success/10 text-success' :
                          order.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {order.status.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No orders yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      When you place orders, they will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Your Orders
            </h1>
            <OrdersList role="customer" />
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Messages
            </h1>
            <ChatInterface />
          </TabsContent>
          
          {/* Baker Application Tab */}
          <TabsContent value="baker-application">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Become a Baker
            </h1>
            <BakerApplication />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Account Settings
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  View and update your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                    <p className="text-neutral-dark">{user?.username}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <p className="text-neutral-dark">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                    <p className="text-neutral-dark">{user?.fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                    <p className="text-neutral-dark capitalize">{user?.role.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="mt-8 flex items-center p-4 bg-amber-50 rounded-md">
                  <AlertCircle className="h-6 w-6 text-amber-500 mr-3" />
                  <div>
                    <p className="text-sm text-amber-800">
                      Profile editing is not available in this demo version.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
}

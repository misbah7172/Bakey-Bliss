import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrdersList from '@/components/dashboard/OrdersList';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Package, CheckCircle2, Clock, Utensils, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function JuniorBakerDashboard() {
  const [_, params] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
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
  const pendingAssignments = orders?.filter(order => 
    order.status === 'assigned' || order.status === 'in_progress'
  ).length || 0;
  
  const completedAssignments = orders?.filter(order => 
    order.status === 'completed' || order.status === 'ready_for_delivery' || order.status === 'delivered'
  ).length || 0;
  
  const hasPendingPromotion = applications?.some((app: any) => app.status === 'pending' && app.requested_role === 'main_baker');
  
  // Handle promotion application
  const handleApplyForPromotion = async () => {
    try {
      await apiRequest('POST', '/api/baker-applications', {
        requested_role: 'main_baker',
        reason: 'Requesting promotion to Main Baker based on completed orders and experience',
        experience: `Successfully completed ${completedAssignments} orders as a Junior Baker.`
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/baker-applications'] });
      
      toast({
        title: 'Application Submitted',
        description: 'Your promotion request has been submitted for review',
      });
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: error instanceof Error ? error.message : 'Failed to submit application',
        variant: 'destructive',
      });
    }
  };
  
  const canApplyForPromotion = completedAssignments >= 5 && !hasPendingPromotion;
  
  return (
    <>
      <Helmet>
        <title>Junior Baker Dashboard | BakeryBliss</title>
      </Helmet>
      
      <DashboardLayout activeTab={activeTab}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark">
              Welcome, Baker {user?.username}!
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Active Assignments Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{pendingAssignments}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders currently assigned to you
                  </p>
                </CardContent>
              </Card>
              
              {/* Completed Orders Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{completedAssignments}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders you've successfully completed
                  </p>
                </CardContent>
              </Card>
              
              {/* Promotion Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Promotion Status</CardTitle>
                  <Utensils className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {isLoadingApplications ? (
                    <Skeleton className="h-8 w-full" />
                  ) : hasPendingPromotion ? (
                    <div className="text-sm font-medium text-amber-600">Application Pending</div>
                  ) : completedAssignments >= 5 ? (
                    <div className="text-sm font-medium text-success">Eligible for Promotion</div>
                  ) : (
                    <div className="text-sm font-medium">
                      {5 - completedAssignments} more orders needed
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {hasPendingPromotion 
                      ? "Your promotion request is being reviewed" 
                      : completedAssignments >= 5 
                        ? "You can now apply for promotion to Main Baker"
                        : "Complete more orders to qualify for promotion"}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Assignments</CardTitle>
                <CardDescription>
                  Your most recent baking assignments
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
                          order.status === 'completed' ? 'bg-success/10 text-success' :
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
                    <h3 className="font-medium text-lg text-neutral-dark">No assignments yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      When you're assigned orders, they will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Your Assignments
            </h1>
            <OrdersList role="junior_baker" />
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Messages
            </h1>
            <ChatInterface />
          </TabsContent>
          
          {/* Promotion Tab */}
          <TabsContent value="promotion">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Promotion to Main Baker
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Career Advancement</CardTitle>
                <CardDescription>
                  Junior Bakers can be promoted to Main Baker after demonstrating their skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Requirements for Promotion:</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <div className={`mr-2 h-5 w-5 rounded-full flex items-center justify-center ${
                          completedAssignments >= 5 ? 'bg-success text-white' : 'bg-neutral-200'
                        }`}>
                          {completedAssignments >= 5 && <CheckCircle2 className="h-3 w-3" />}
                        </div>
                        <span>Complete at least 5 orders ({completedAssignments}/5)</span>
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-5 w-5 rounded-full flex items-center justify-center bg-success text-white">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span>Maintain good customer ratings</span>
                      </li>
                      <li className="flex items-center">
                        <div className="mr-2 h-5 w-5 rounded-full flex items-center justify-center bg-success text-white">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span>Submit promotion application</span>
                      </li>
                    </ul>
                  </div>
                  
                  {hasPendingPromotion ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                      <h3 className="font-medium text-amber-800 mb-2">
                        Your promotion request is being reviewed
                      </h3>
                      <p className="text-sm text-amber-700">
                        Our admin team is reviewing your application. You'll be notified once a decision is made.
                      </p>
                    </div>
                  ) : canApplyForPromotion ? (
                    <div>
                      <h3 className="font-medium mb-2">Ready for Promotion!</h3>
                      <p className="text-sm text-neutral-dark/80 mb-4">
                        Congratulations! You've met all the requirements to apply for promotion to Main Baker.
                      </p>
                      <Button 
                        className="bg-primary hover:bg-primary-light"
                        onClick={handleApplyForPromotion}
                      >
                        Apply for Promotion
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-neutral-100 border border-neutral-200 rounded-md p-4">
                      <h3 className="font-medium mb-2">Keep Going!</h3>
                      <p className="text-sm text-neutral-dark/80">
                        You need to complete {5 - completedAssignments} more orders to be eligible for promotion.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
}

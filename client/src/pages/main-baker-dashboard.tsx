import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OrdersList from '@/components/dashboard/OrdersList';
import ChatInterface from '@/components/dashboard/ChatInterface';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Package, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ChefHat,
  AlertCircle 
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: number;
  status: string;
  total_amount: number;
  created_at: string;
  customer_id: number;
  main_baker_id?: number;
  junior_baker_id?: number;
}

interface User {
  id: number;
  username: string;
  role: string;
}

export default function MainBakerDashboard() {
  const [_, params] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [selectedBaker, setSelectedBaker] = useState<string>('');
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: !!user,
  });
  
  const { data: juniorBakers, isLoading: isLoadingBakers } = useQuery<User[]>({
    queryKey: ['/api/junior-baker'],
    enabled: !!user && activeTab === 'assign',
  });
  
  // Set active tab from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [params]);
  
  // Reset selection when tab changes
  useEffect(() => {
    setSelectedOrder(null);
    setSelectedBaker('');
  }, [activeTab]);
  
  // Calculate dashboard stats
  const pendingAssignments = orders?.filter(order => 
    order.status === 'pending' && !order.junior_baker_id
  ).length || 0;
  
  const inProgressOrders = orders?.filter(order => 
    order.status === 'assigned' || order.status === 'in_progress'
  ).length || 0;
  
  const completedOrders = orders?.filter(order => 
    order.status === 'completed' || order.status === 'ready_for_delivery' || order.status === 'delivered'
  ).length || 0;
  
  // Assignment mutation
  const assignOrderMutation = useMutation({
    mutationFn: async ({ orderId, juniorBakerId }: { orderId: number, juniorBakerId: number }) => {
      const res = await apiRequest('PUT', `/api/baker/orders/${orderId}/assign`, {
        juniorBakerId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'Order Assigned',
        description: 'The order has been assigned successfully',
      });
      setSelectedOrder(null);
      setSelectedBaker('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle assignment
  const handleAssign = () => {
    if (!selectedOrder || !selectedBaker) {
      toast({
        title: 'Missing Information',
        description: 'Please select both an order and a baker',
        variant: 'destructive',
      });
      return;
    }
    
    assignOrderMutation.mutate({
      orderId: selectedOrder,
      juniorBakerId: parseInt(selectedBaker)
    });
  };
  
  // Get unassigned orders
  const unassignedOrders = orders?.filter(order => 
    order.status === 'pending' && !order.junior_baker_id
  ) || [];
  
  return (
    <>
      <Helmet>
        <title>Main Baker Dashboard | BakeryBliss</title>
      </Helmet>
      
      <DashboardLayout activeTab={activeTab}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="assign">Assign Orders</TabsTrigger>
            <TabsTrigger value="orders">All Orders</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark">
              Welcome, Master Baker {user?.username}!
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pending Assignments Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{pendingAssignments}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders waiting to be assigned
                  </p>
                </CardContent>
              </Card>
              
              {/* In Progress Orders Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <ChefHat className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{inProgressOrders}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders currently being prepared
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
                    <div className="text-2xl font-bold">{completedOrders}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders completed successfully
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Pending Assignments */}
            <Card>
              <CardHeader>
                <CardTitle>Orders Awaiting Assignment</CardTitle>
                <CardDescription>
                  Assign these orders to junior bakers
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
                ) : unassignedOrders.length > 0 ? (
                  <div className="space-y-4">
                    {unassignedOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Order #{order.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveTab('assign');
                            setSelectedOrder(order.id);
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                    {unassignedOrders.length > 5 && (
                      <Button 
                        variant="link" 
                        className="w-full"
                        onClick={() => setActiveTab('assign')}
                      >
                        View All ({unassignedOrders.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No pending orders</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      All current orders have been assigned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Junior Bakers Status */}
            <Card>
              <CardHeader>
                <CardTitle>Junior Bakers Team</CardTitle>
                <CardDescription>
                  Status of your junior baker team
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBakers ? (
                  <div className="space-y-4">
                    {Array(3).fill(null).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : juniorBakers && juniorBakers.length > 0 ? (
                  <div className="space-y-4">
                    {juniorBakers.slice(0, 5).map((baker) => (
                      <div key={baker.id} className="flex items-center justify-between">
                        <div className="font-medium">{baker.username}</div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          Available
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No junior bakers yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Junior bakers will appear here once hired
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Assign Orders Tab */}
          <TabsContent value="assign">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Assign Orders to Junior Bakers
            </h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Order Assignment</CardTitle>
                <CardDescription>
                  Select an order and a junior baker to make an assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Select Order</Label>
                    <Select
                      value={selectedOrder ? String(selectedOrder) : ""}
                      onValueChange={(value) => setSelectedOrder(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedOrders.map((order) => (
                          <SelectItem key={order.id} value={String(order.id)}>
                            Order #{order.id} ({new Date(order.created_at).toLocaleDateString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Junior Baker</Label>
                    <Select
                      value={selectedBaker}
                      onValueChange={setSelectedBaker}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a baker" />
                      </SelectTrigger>
                      <SelectContent>
                        {juniorBakers?.map((baker) => (
                          <SelectItem key={baker.id} value={String(baker.id)}>
                            {baker.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  className="w-full md:w-auto bg-primary hover:bg-primary-light mt-4"
                  onClick={handleAssign}
                  disabled={!selectedOrder || !selectedBaker || assignOrderMutation.isPending}
                >
                  {assignOrderMutation.isPending ? 'Assigning...' : 'Assign Order'}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Unassigned Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <Skeleton className="h-64 w-full" />
                ) : unassignedOrders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {order.status.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedOrder(order.id)}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No unassigned orders</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      All current orders have been assigned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              All Orders
            </h1>
            <OrdersList role="main_baker" />
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Messages
            </h1>
            <ChatInterface />
          </TabsContent>
          
          {/* Bakers Tab */}
          <TabsContent value="bakers">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Junior Bakers Team
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Team</CardTitle>
                <CardDescription>
                  Junior bakers working under your supervision
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingBakers ? (
                  <Skeleton className="h-64 w-full" />
                ) : juniorBakers && juniorBakers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Baker</TableHead>
                        <TableHead>Assigned Orders</TableHead>
                        <TableHead>Completed Orders</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {juniorBakers.map((baker) => {
                        // Calculate baker stats from orders
                        const assignedOrders = orders?.filter(order => 
                          order.junior_baker_id === baker.id && 
                          ['assigned', 'in_progress'].includes(order.status)
                        ).length || 0;
                        
                        const completedOrders = orders?.filter(order => 
                          order.junior_baker_id === baker.id && 
                          ['completed', 'ready_for_delivery', 'delivered'].includes(order.status)
                        ).length || 0;
                        
                        return (
                          <TableRow key={baker.id}>
                            <TableCell className="font-medium">{baker.username}</TableCell>
                            <TableCell>{assignedOrders}</TableCell>
                            <TableCell>{completedOrders}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                assignedOrders > 2 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-success/10 text-success'
                              }`}>
                                {assignedOrders > 2 ? 'Busy' : 'Available'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No junior bakers yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Junior bakers will appear here once hired
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
}

// Label component for completeness
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-medium text-neutral-dark mb-1.5">{children}</div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Order, OrderItem } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ShoppingBag, MessageCircle, Package, Clock, CheckCircle2, AlertCircle, 
  Download, Truck, Search
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { generateReceipt } from '@/lib/receipt-generator';
import { useAuth } from '@/hooks/use-auth';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface OrdersListProps {
  role: 'customer' | 'junior_baker' | 'main_baker' | 'admin';
}

interface OrderWithItems extends Omit<Order, 'payment_method' | 'delivery_info'> {
  items: OrderItem[];
  payment_method: string | null;
  delivery_info?: {
    address: string;
    city: string;
    zip_code: string;
    phone: string;
    special_instructions?: string;
  };
}

export default function OrdersList({ role }: OrdersListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [orderIdToTrack, setOrderIdToTrack] = useState('');
  const [trackingError, setTrackingError] = useState('');
  const itemsPerPage = 5;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
  });
  
  const { data: deliveryInfo } = useQuery<any>({
    queryKey: ['/api/orders', selectedOrder?.id, 'delivery-info'],
    enabled: !!selectedOrder,
  });
  
  // Function to handle order status update by baker
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update order status');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Order status has been successfully updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleDownloadReceipt = (order: OrderWithItems) => {
    if (!user) return;
    
    // Generate receipt
    generateReceipt({
      orderId: order.id,
      orderDate: order.created_at || new Date(),
      totalAmount: order.total_amount,
      paymentMethod: order.payment_method || 'credit_card',
      items: order.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customization: item.customization as Record<string, any>
      })),
      deliveryInfo: {
        address: deliveryInfo?.address || 'N/A',
        city: deliveryInfo?.city || 'N/A',
        zipCode: deliveryInfo?.zip_code || 'N/A',
        phone: deliveryInfo?.phone || 'N/A',
        specialInstructions: deliveryInfo?.special_instructions
      },
      customerName: user.username
    });
    
    toast({
      title: "Receipt Generated",
      description: "Your receipt is being downloaded",
    });
  };
  
  const handleTrackOrder = () => {
    if (!orderIdToTrack) {
      setTrackingError('Please enter an order ID');
      return;
    }
    
    const orderIdNum = parseInt(orderIdToTrack);
    if (isNaN(orderIdNum)) {
      setTrackingError('Order ID must be a number');
      return;
    }
    
    const order = orders?.find(o => o.id === orderIdNum);
    if (!order) {
      setTrackingError('Order not found');
      return;
    }
    
    setSelectedOrder(order);
    setTrackingError('');
    setIsTrackingDialogOpen(false);
    setIsOrderDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 my-4 border border-destructive rounded-md bg-destructive/10 text-destructive">
        <h3 className="font-semibold flex items-center gap-2">
          <AlertCircle size={18} />
          Error Loading Orders
        </h3>
        <p className="text-sm mt-1">There was a problem loading your orders. Please try again later.</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No orders found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === 'customer' 
            ? "You haven't placed any orders yet. Browse our products and place your first order!"
            : "There are no orders assigned to you yet."}
        </p>
        {role === 'customer' && (
          <Button className="mt-4" variant="default">
            Browse Products
          </Button>
        )}
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'delivered':
        return <ShoppingBag className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Order Tracking Button (only for customers) */}
      {role === 'customer' && (
        <div className="flex justify-end mb-4">
          <Button 
            onClick={() => setIsTrackingDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Track Order
          </Button>
        </div>
      )}
      
      {currentOrders.map((order) => (
        <Card key={order.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.created_at?.toString() || Date.now()).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge 
                className={`flex items-center gap-1 ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-2">
                {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'} • Total: {formatCurrency(order.total_amount)}
              </div>
              
              <div className="grid gap-2">
                {order.items?.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
                
                {order.items && order.items.length > 2 && (
                  <p className="text-xs text-muted-foreground pt-1">
                    +{order.items.length - 2} more items
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-between items-center">
            {role === 'customer' ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> 
                  Contact Baker
                </Button>
                
                {/* Download Receipt Button (only for completed/delivered orders) */}
                {['completed', 'delivered'].includes(order.status) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    onClick={() => {
                      setSelectedOrder(order);
                      handleDownloadReceipt(order);
                    }}
                  >
                    <Download className="h-4 w-4" /> 
                    Receipt
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="" alt="Customer" />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {order.customer_id.toString().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">Customer #{order.customer_id}</span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedOrder(order);
                  setIsOrderDetailsOpen(true);
                }}
              >
                Details
              </Button>
              
              {role === 'main_baker' && order.status === 'pending' && (
                <Button variant="default" size="sm">
                  Assign
                </Button>
              )}
              
              {(role === 'junior_baker' || role === 'main_baker') && 
               ['pending', 'processing'].includes(order.status) && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(order);
                    
                    // Determine the next status based on current status
                    const nextStatus = order.status === 'pending' ? 'processing' : 'completed';
                    
                    // Show confirmation toast before updating
                    toast({
                      title: `Update Status?`,
                      description: `Change order status from ${order.status} to ${nextStatus}?`,
                      action: (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            updateOrderStatusMutation.mutate({
                              orderId: order.id,
                              status: nextStatus
                            });
                          }}
                        >
                          Update
                        </Button>
                      ),
                    });
                  }}
                >
                  Update Status
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center text-sm px-2">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Order Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Track Your Order</DialogTitle>
            <DialogDescription>
              Enter your order ID to check its current status and details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Order ID"
                value={orderIdToTrack}
                onChange={(e) => setOrderIdToTrack(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleTrackOrder}
                className="shrink-0"
              >
                Track
              </Button>
            </div>
            
            {trackingError && (
              <p className="text-sm text-destructive">{trackingError}</p>
            )}
          </div>
          
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder?.created_at && new Date(selectedOrder.created_at.toString()).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status Tracker */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Order Status</h3>
                <div className="relative">
                  <Progress 
                    value={
                      selectedOrder.status === 'pending' ? 25 :
                      selectedOrder.status === 'processing' ? 50 :
                      selectedOrder.status === 'completed' ? 75 :
                      selectedOrder.status === 'delivered' ? 100 : 25
                    } 
                    className="h-2"
                  />
                  <div className="flex justify-between mt-2 text-xs">
                    <div className="flex flex-col items-center">
                      <Clock className={`h-4 w-4 ${selectedOrder.status === 'pending' ? 'text-primary' : ''}`} />
                      <span>Pending</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Package className={`h-4 w-4 ${selectedOrder.status === 'processing' ? 'text-primary' : ''}`} />
                      <span>Processing</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className={`h-4 w-4 ${selectedOrder.status === 'completed' ? 'text-primary' : ''}`} />
                      <span>Completed</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Truck className={`h-4 w-4 ${selectedOrder.status === 'delivered' ? 'text-primary' : ''}`} />
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium mb-3">Order Items</h3>
                <Accordion type="single" collapsible>
                  <AccordionItem value="items">
                    <AccordionTrigger className="text-sm">
                      {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'} - {formatCurrency(selectedOrder.total_amount)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              
              {/* Payment Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Payment Information</h3>
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Method</span>
                    <span>{selectedOrder.payment_method ? 
                      selectedOrder.payment_method === 'credit_card' ? 'Credit Card' : 
                      selectedOrder.payment_method === 'paypal' ? 'PayPal' : 
                      selectedOrder.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                      selectedOrder.payment_method : 'Credit Card'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              {/* Download Receipt (only for completed/delivered orders) */}
              {role === 'customer' && ['completed', 'delivered'].includes(selectedOrder.status) && (
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => handleDownloadReceipt(selectedOrder)}
                >
                  <Download className="h-4 w-4 mr-2" /> 
                  Download Receipt
                </Button>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOrderDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
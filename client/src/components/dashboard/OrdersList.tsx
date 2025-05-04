import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Order, OrderItem } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShoppingBag, MessageCircle, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrdersListProps {
  role: 'customer' | 'junior_baker' | 'main_baker' | 'admin';
}

interface OrderWithItems extends Order {
  items: OrderItem[];
}

export default function OrdersList({ role }: OrdersListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const { data: orders, isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ['/api/orders'],
  });

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
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" /> 
                Contact Baker
              </Button>
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
              <Button variant="outline" size="sm">
                Details
              </Button>
              
              {role === 'main_baker' && order.status === 'pending' && (
                <Button variant="default" size="sm">
                  Assign
                </Button>
              )}
              
              {(role === 'junior_baker' || role === 'main_baker') && 
               ['pending', 'processing'].includes(order.status) && (
                <Button variant="default" size="sm">
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
    </div>
  );
}
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
  ShoppingBag, 
  FileText, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  Edit,
  Trash2,
  Search
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface User {
  id: number;
  username: string;
  role: string;
  email?: string;
  fullName?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: number;
  is_featured: boolean;
  is_new: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface BakerApplication {
  id: number;
  user_id: number;
  current_role: string;
  requested_role: string;
  experience: string;
  reason: string;
  status: string;
  created_at: string;
  user?: User;
}

export default function AdminDashboard() {
  const [_, params] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productFormData, setProductFormData] = useState({
    id: 0,
    name: '',
    description: '',
    price: '',
    image: '',
    category_id: '',
    is_featured: false,
    is_new: false
  });
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Queries
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && user.role === 'admin',
  });
  
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    enabled: !!user && (activeTab === 'dashboard' || activeTab === 'products'),
  });
  
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user && (activeTab === 'products'),
  });
  
  const { data: applications, isLoading: isLoadingApplications } = useQuery<BakerApplication[]>({
    queryKey: ['/api/baker-applications'],
    enabled: !!user && (activeTab === 'dashboard' || activeTab === 'applications'),
  });
  
  const { data: orders, isLoading: isLoadingOrders } = useQuery<any[]>({
    queryKey: ['/api/orders'],
    enabled: !!user && activeTab === 'dashboard',
  });
  
  // Set active tab from URL query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [params]);
  
  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/admin/products', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Product Created',
        description: 'The product has been created successfully',
      });
      setIsProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const res = await apiRequest('PUT', `/api/admin/products/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Product Updated',
        description: 'The product has been updated successfully',
      });
      setIsProductDialogOpen(false);
      resetProductForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/admin/products/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: 'Product Deleted',
        description: 'The product has been deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const respondToApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest('PUT', `/api/admin/baker-applications/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/baker-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Application Updated',
        description: 'The application status has been updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Operation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Helper functions
  const resetProductForm = () => {
    setProductFormData({
      id: 0,
      name: '',
      description: '',
      price: '',
      image: '',
      category_id: '',
      is_featured: false,
      is_new: false
    });
    setIsEditMode(false);
  };
  
  const handleEditProduct = (product: Product) => {
    setProductFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category_id: product.category_id.toString(),
      is_featured: product.is_featured,
      is_new: product.is_new
    });
    setIsEditMode(true);
    setIsProductDialogOpen(true);
  };
  
  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: productFormData.name,
      description: productFormData.description,
      price: parseFloat(productFormData.price) || 0,
      image: productFormData.image,
      category_id: parseInt(productFormData.category_id) || 0,
      is_featured: productFormData.is_featured,
      is_new: productFormData.is_new
    };
    
    if (isEditMode) {
      updateProductMutation.mutate({ id: productFormData.id, data: productData });
    } else {
      createProductMutation.mutate(productData);
    }
  };
  
  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };
  
  const respondToApplication = (id: number, status: 'approved' | 'rejected') => {
    respondToApplicationMutation.mutate({ id, status });
  };
  
  // Filter products by search term
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Calculate dashboard stats
  const totalUsers = users?.length || 0;
  const totalProducts = products?.length || 0;
  const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0;
  const totalOrders = orders?.length || 0;
  
  // Get pending applications
  const pendingApplicationsList = applications?.filter(app => app.status === 'pending') || [];
  
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | BakeryBliss</title>
      </Helmet>
      
      <DashboardLayout activeTab={activeTab}>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-5 w-full max-w-xl">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark">
              Admin Dashboard
            </h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Users Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingUsers ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{totalUsers}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Registered users on the platform
                  </p>
                </CardContent>
              </Card>
              
              {/* Products Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{totalProducts}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Products in the catalog
                  </p>
                </CardContent>
              </Card>
              
              {/* Applications Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                  <FileText className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {isLoadingApplications ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{pendingApplications}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Baker applications awaiting review
                  </p>
                </CardContent>
              </Card>
              
              {/* Orders Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-2xl font-bold">{totalOrders}</div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Orders placed on the platform
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Pending Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Baker Applications</CardTitle>
                <CardDescription>
                  Applications awaiting your review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingApplications ? (
                  <div className="space-y-4">
                    {Array(3).fill(null).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingApplicationsList.length > 0 ? (
                  <div className="space-y-6">
                    {pendingApplicationsList.slice(0, 3).map((application) => (
                      <div key={application.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              {application.user?.username || `User #${application.user_id}`}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Requesting: <span className="font-medium capitalize">{application.requested_role.replace('_', ' ')}</span>
                            </p>
                          </div>
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </div>
                        </div>
                        
                        <p className="text-sm mb-4 text-neutral-dark/80 bg-neutral-50 p-2 rounded">
                          {application.reason}
                        </p>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => respondToApplication(application.id, 'rejected')}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-success border-success hover:bg-success/10"
                            onClick={() => respondToApplication(application.id, 'approved')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {pendingApplicationsList.length > 3 && (
                      <Button 
                        variant="link" 
                        className="w-full"
                        onClick={() => setActiveTab('applications')}
                      >
                        View All Applications ({pendingApplicationsList.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No pending applications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      All baker applications have been handled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              User Management
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage user accounts and roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <Skeleton className="h-64 w-full" />
                ) : users && users.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.fullName || '-'}</TableCell>
                          <TableCell>{user.email || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-primary text-white' :
                              user.role === 'main_baker' ? 'bg-success text-white' :
                              user.role === 'junior_baker' ? 'bg-amber-100 text-amber-800' :
                              'bg-neutral-100 text-neutral-800'
                            }`}>
                              {user.role.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-4">
                                  <h4 className="font-medium">Edit User Role</h4>
                                  <Select defaultValue={user.role}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="customer">Customer</SelectItem>
                                      <SelectItem value="junior_baker">Junior Baker</SelectItem>
                                      <SelectItem value="main_baker">Main Baker</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button size="sm" className="w-full">Save Changes</Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No users found</h3>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-6">
              <h1 className="font-heading text-2xl font-bold text-neutral-dark">
                Product Management
              </h1>
              
              <Button 
                onClick={() => {
                  resetProductForm();
                  setIsProductDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary-light"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center">
                  <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>All Products</CardTitle>
                <CardDescription>
                  Manage your product catalog
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <Skeleton className="h-64 w-full" />
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => {
                        const category = categories?.find(c => c.id === product.category_id);
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded mr-2 object-cover"
                                />
                                <span>{product.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                            <TableCell>{category?.name || `-`}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {product.is_featured && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-accent/10 text-accent">
                                    Featured
                                  </span>
                                )}
                                {product.is_new && (
                                  <span className="px-2 py-1 rounded-full text-xs bg-success/10 text-success">
                                    New
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive/80"
                                  onClick={() => handleDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No products found</h3>
                    {searchTerm && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search term
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Product Form Dialog */}
            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update product details' : 'Fill in the details to add a new product'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleProductFormSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input 
                          id="name" 
                          value={productFormData.name}
                          onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input 
                          id="price" 
                          type="number"
                          step="0.01"
                          min="0"
                          value={productFormData.price}
                          onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="image">Image URL</Label>
                      <Input 
                        id="image" 
                        value={productFormData.image}
                        onChange={(e) => setProductFormData({...productFormData, image: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={productFormData.category_id}
                        onValueChange={(value) => setProductFormData({...productFormData, category_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        value={productFormData.description}
                        onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={productFormData.is_featured}
                          onChange={(e) => setProductFormData({...productFormData, is_featured: e.target.checked})}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="is_featured">Featured Product</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_new"
                          checked={productFormData.is_new}
                          onChange={(e) => setProductFormData({...productFormData, is_new: e.target.checked})}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="is_new">New Arrival</Label>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsProductDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary-light"
                      disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    >
                      {(createProductMutation.isPending || updateProductMutation.isPending) ? 
                        'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Order Management
            </h1>
            <OrdersList role="admin" />
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Baker Applications
            </h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
                <CardDescription>
                  Applications waiting for your review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingApplications ? (
                  <Skeleton className="h-64 w-full" />
                ) : pendingApplicationsList.length > 0 ? (
                  <div className="space-y-6">
                    {pendingApplicationsList.map((application) => (
                      <div key={application.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-medium text-lg">
                              {application.user?.username || `User #${application.user_id}`}
                            </h3>
                            <div className="mt-1 flex items-center">
                              <span className="text-sm text-muted-foreground">Current Role:</span>
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100">
                                {application.current_role.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center">
                              <span className="text-sm text-muted-foreground">Requested Role:</span>
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                {application.requested_role.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Applied on: {new Date(application.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-1">Experience:</h4>
                          <p className="text-sm text-neutral-dark/80 bg-neutral-50 p-2 rounded">
                            {application.experience || 'No experience details provided'}
                          </p>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-sm font-medium mb-1">Reason for Application:</h4>
                          <p className="text-sm text-neutral-dark/80 bg-neutral-50 p-2 rounded">
                            {application.reason}
                          </p>
                        </div>
                        
                        <div className="flex justify-end space-x-3">
                          <Button 
                            variant="outline" 
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => respondToApplication(application.id, 'rejected')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject Application
                          </Button>
                          <Button 
                            className="bg-success hover:bg-success/90"
                            onClick={() => respondToApplication(application.id, 'approved')}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve & Promote
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No pending applications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      All applications have been processed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Application History</CardTitle>
                <CardDescription>
                  Previously processed applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingApplications ? (
                  <Skeleton className="h-64 w-full" />
                ) : applications && applications.filter(app => app.status !== 'pending').length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Requested Role</TableHead>
                        <TableHead>Application Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Decided By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications
                        .filter(app => app.status !== 'pending')
                        .map((application) => (
                          <TableRow key={application.id}>
                            <TableCell className="font-medium">
                              {application.user?.username || `User #${application.user_id}`}
                            </TableCell>
                            <TableCell>
                              {application.requested_role.replace('_', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())}
                            </TableCell>
                            <TableCell>
                              {new Date(application.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                application.status === 'approved' ? 'bg-success/10 text-success' : 
                                'bg-destructive/10 text-destructive'
                              }`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              Admin #{application.reviewed_by}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg text-neutral-dark">No processed applications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Previous application decisions will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <h1 className="font-heading text-2xl font-bold text-neutral-dark mb-6">
              Messages
            </h1>
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
}

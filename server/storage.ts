import { users, User, InsertUser, categories, Category, InsertCategory, products, Product, InsertProduct, orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, chatMessages, ChatMessage, InsertChatMessage, bakerApplications, BakerApplication, InsertBakerApplication, orderReviews, OrderReview, InsertOrderReview, notifications, Notification, InsertNotification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User related methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, role: string): Promise<User | undefined>;
  
  // Category related methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product related methods
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order related methods
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  getOrdersByMainBaker(bakerId: number): Promise<Order[]>;
  getOrdersByJuniorBaker(bakerId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  assignOrderToBaker(orderId: number, mainBakerId?: number, juniorBakerId?: number): Promise<Order | undefined>;
  
  // Order items related methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Chat messages related methods
  getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(messageIds: number[]): Promise<boolean>;
  
  // Baker applications related methods
  getBakerApplications(): Promise<BakerApplication[]>;
  getBakerApplicationById(id: number): Promise<BakerApplication | undefined>;
  getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]>;
  createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication>;
  updateBakerApplicationStatus(id: number, status: string, reviewerId: number): Promise<BakerApplication | undefined>;
  
  // Order reviews related methods
  getOrderReviews(orderId: number): Promise<OrderReview[]>;
  getReviewsByJuniorBaker(juniorBakerId: number): Promise<OrderReview[]>;
  getJuniorBakerAverageRating(juniorBakerId: number): Promise<number>;
  createOrderReview(review: InsertOrderReview): Promise<OrderReview>;
  
  // Notifications related methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private chatMessages: Map<number, ChatMessage>;
  private bakerApplications: Map<number, BakerApplication>;
  private orderReviews: Map<number, OrderReview>;
  private notifications: Map<number, Notification>;
  
  userCurrentId: number;
  categoryCurrentId: number;
  productCurrentId: number;
  orderCurrentId: number;
  orderItemCurrentId: number;
  chatMessageCurrentId: number;
  bakerApplicationCurrentId: number;
  orderReviewCurrentId: number;
  notificationCurrentId: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.chatMessages = new Map();
    this.bakerApplications = new Map();
    this.orderReviews = new Map();
    this.notifications = new Map();
    
    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.chatMessageCurrentId = 1;
    this.bakerApplicationCurrentId = 1;
    this.orderReviewCurrentId = 1;
    this.notificationCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with some categories
    this.seedCategories();
  }

  // User related methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id, created_at: new Date() };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, role };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Category related methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Product related methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category_id === categoryId
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.is_featured
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const newProduct: Product = { 
      ...product, 
      id, 
      created_at: new Date() 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const existingProduct = await this.getProductById(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Order related methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }
  
  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.customer_id === customerId
    );
  }
  
  async getOrdersByMainBaker(bakerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.main_baker_id === bakerId
    );
  }
  
  async getOrdersByJuniorBaker(bakerId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.junior_baker_id === bakerId
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const now = new Date();
    const newOrder: Order = { 
      ...order, 
      id, 
      created_at: now,
      updated_at: now
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrderById(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      updated_at: new Date()
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  async assignOrderToBaker(orderId: number, mainBakerId?: number, juniorBakerId?: number): Promise<Order | undefined> {
    const order = await this.getOrderById(orderId);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order,
      main_baker_id: mainBakerId !== undefined ? mainBakerId : order.main_baker_id,
      junior_baker_id: juniorBakerId !== undefined ? juniorBakerId : order.junior_baker_id,
      updated_at: new Date()
    };
    
    // If we're assigning, update status to assigned
    if ((mainBakerId || juniorBakerId) && order.status === 'pending') {
      updatedOrder.status = 'assigned';
    }
    
    this.orders.set(orderId, updatedOrder);
    return updatedOrder;
  }
  
  // Order items related methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.order_id === orderId
    );
  }
  
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }
  
  // Chat messages related methods
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => 
        (message.sender_id === senderId && message.receiver_id === receiverId) ||
        (message.sender_id === receiverId && message.receiver_id === senderId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.receiver_id === userId && !message.read
    ).length;
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageCurrentId++;
    const newMessage: ChatMessage = { 
      ...message, 
      id, 
      read: false,
      timestamp: new Date()
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }
  
  async markMessagesAsRead(messageIds: number[]): Promise<boolean> {
    let success = true;
    
    for (const id of messageIds) {
      const message = this.chatMessages.get(id);
      if (message) {
        this.chatMessages.set(id, { ...message, read: true });
      } else {
        success = false;
      }
    }
    
    return success;
  }
  
  // Baker applications related methods
  async getBakerApplications(): Promise<BakerApplication[]> {
    return Array.from(this.bakerApplications.values());
  }
  
  async getBakerApplicationById(id: number): Promise<BakerApplication | undefined> {
    return this.bakerApplications.get(id);
  }
  
  async getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]> {
    return Array.from(this.bakerApplications.values()).filter(
      (application) => application.user_id === userId
    );
  }
  
  async createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication> {
    const id = this.bakerApplicationCurrentId++;
    const newApplication: BakerApplication = { 
      ...application, 
      id, 
      status: 'pending',
      created_at: new Date(),
      completed_orders: 0
    };
    this.bakerApplications.set(id, newApplication);
    return newApplication;
  }
  
  async updateBakerApplicationStatus(id: number, status: string, reviewerId: number): Promise<BakerApplication | undefined> {
    const application = await this.getBakerApplicationById(id);
    if (!application) return undefined;
    
    const updatedApplication = { 
      ...application, 
      status,
      reviewed_at: new Date(),
      reviewed_by: reviewerId
    };
    this.bakerApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Order reviews related methods
  async getOrderReviews(orderId: number): Promise<OrderReview[]> {
    return Array.from(this.orderReviews.values()).filter(
      (review) => review.order_id === orderId
    );
  }
  
  async getReviewsByJuniorBaker(juniorBakerId: number): Promise<OrderReview[]> {
    return Array.from(this.orderReviews.values()).filter(
      (review) => review.junior_baker_id === juniorBakerId
    );
  }
  
  async getJuniorBakerAverageRating(juniorBakerId: number): Promise<number> {
    const reviews = await this.getReviewsByJuniorBaker(juniorBakerId);
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
  
  async createOrderReview(review: InsertOrderReview): Promise<OrderReview> {
    const id = this.orderReviewCurrentId++;
    const newReview: OrderReview = {
      ...review,
      id,
      created_at: new Date()
    };
    this.orderReviews.set(id, newReview);
    return newReview;
  }
  
  // Notifications related methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.user_id === userId && !notification.read
    ).length;
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationCurrentId++;
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: new Date(),
      read: false
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    let success = true;
    
    const userNotifications = Array.from(this.notifications.values()).filter(
      (notification) => notification.user_id === userId && !notification.read
    );
    
    for (const notification of userNotifications) {
      const updated = await this.markNotificationAsRead(notification.id);
      if (!updated) success = false;
    }
    
    return success;
  }
  
  // Seed initial categories
  private seedCategories() {
    const categories = [
      { name: "Bread & Loaves", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Cakes & Pastries", image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Cookies & Biscuits", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Pies & Tarts", image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Doughnuts & Croissants", image: "https://images.unsplash.com/photo-1559620192-032c4bc4674e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Savory Items", image: "https://images.unsplash.com/photo-1604917877934-07d8d248d396?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Custom Chocolates", image: "https://images.unsplash.com/photo-1519915028121-7d3463d5b1ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Seasonal & Special Items", image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
      { name: "Beverages", image: "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" },
    ];
    
    categories.forEach(category => {
      const id = this.categoryCurrentId++;
      this.categories.set(id, { ...category, id });
    });
  }
}

export const storage = new MemStorage();

import { users, User, InsertUser, categories, Category, InsertCategory, products, Product, InsertProduct, orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, chatMessages, ChatMessage, InsertChatMessage, bakerApplications, BakerApplication, InsertBakerApplication, orderReviews, OrderReview, InsertOrderReview, notifications, Notification, InsertNotification } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import MySQLStore from "express-mysql-session";
import { pool } from "./db";
import express, { type Request, Response, NextFunction } from "express";

const MemoryStore = createMemoryStore(session);

// Create MySQL session store options
const sessionStoreOptions = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bakerybliss',
  createDatabaseTable: true
};

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
  sessionStore: any; // Using any for session store to avoid type conflicts
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
  
  sessionStore: any;

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

export class MySQLStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Initialize session store with proper options
    const SessionStore = MySQLStore(session);
    this.sessionStore = new SessionStore(sessionStoreOptions, pool);
  }

  // User related methods
  async getUsers(): Promise<User[]> {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows as User[];
  }

  async getUser(id: number): Promise<User | undefined> {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return (rows as User[])[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return (rows as User[])[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await pool.query(
      'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [user.username, user.password, user.email || null, user.fullName || null, user.role || 'customer']
    );
    const id = (result as any).insertId;
    return this.getUser(id) as Promise<User>;
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    return this.getUser(userId);
  }

  // Category related methods
  async getCategories(): Promise<Category[]> {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows as Category[];
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return (rows as Category[])[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [result] = await pool.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [category.name, category.description || null]
    );
    const id = (result as any).insertId;
    return this.getCategoryById(id) as Promise<Category>;
  }

  // Product related methods
  async getProducts(): Promise<Product[]> {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows as Product[];
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return (rows as Product[])[0];
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    const [rows] = await pool.query('SELECT * FROM products WHERE category_id = ?', [categoryId]);
    return rows as Product[];
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const [rows] = await pool.query('SELECT * FROM products WHERE is_featured = TRUE');
    return rows as Product[];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, image, category_id, is_featured, is_new) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        product.name,
        product.description,
        product.price,
        product.image,
        product.category_id,
        product.is_featured || false,
        product.is_new || false
      ]
    );
    const id = (result as any).insertId;
    return this.getProductById(id) as Promise<Product>;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined> {
    const updates = Object.entries(product)
      .filter(([key]) => key !== 'id')
      .map(([key]) => `${key} = ?`);
    const values = Object.values(product).filter(value => value !== undefined);
    
    if (updates.length === 0) return this.getProductById(id);
    
    await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    return this.getProductById(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  // Chat messages related methods
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    const [rows] = await pool.query(
      'SELECT * FROM chat_messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
      [senderId, receiverId, receiverId, senderId]
    );
    return rows as ChatMessage[];
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND is_read = FALSE',
      [userId]
    );
    return (rows as any)[0].count;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [result] = await pool.query(
      'INSERT INTO chat_messages (sender_id, receiver_id, order_id, content, is_read) VALUES (?, ?, ?, ?, FALSE)',
      [message.sender_id, message.receiver_id, message.order_id || null, message.content]
    );
    const id = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [id]);
    return (rows as ChatMessage[])[0];
  }

  async markMessagesAsRead(messageIds: number[]): Promise<boolean> {
    if (messageIds.length === 0) return true;
    const [result] = await pool.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE id IN (?)',
      [messageIds]
    );
    return (result as any).affectedRows > 0;
  }

  // Baker applications related methods
  async getBakerApplications(): Promise<BakerApplication[]> {
    const [rows] = await pool.query('SELECT * FROM baker_applications');
    return rows as BakerApplication[];
  }

  async getBakerApplicationById(id: number): Promise<BakerApplication | undefined> {
    const [rows] = await pool.query('SELECT * FROM baker_applications WHERE id = ?', [id]);
    return (rows as BakerApplication[])[0];
  }

  async getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]> {
    const [rows] = await pool.query('SELECT * FROM baker_applications WHERE user_id = ?', [userId]);
    return rows as BakerApplication[];
  }

  async createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication> {
    const [result] = await pool.query(
      'INSERT INTO baker_applications (user_id, current_role, requested_role, experience, reason, preferred_main_baker_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        application.user_id,
        application.current_role,
        application.requested_role,
        application.experience || null,
        application.reason,
        application.preferred_main_baker_id || null,
        'pending'
      ]
    );
    const id = (result as any).insertId;
    return this.getBakerApplicationById(id) as Promise<BakerApplication>;
  }

  async updateBakerApplicationStatus(id: number, status: string, reviewerId: number): Promise<BakerApplication | undefined> {
    await pool.query(
      'UPDATE baker_applications SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?',
      [status, reviewerId, id]
    );
    return this.getBakerApplicationById(id);
  }

  // Order items related methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const [rows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return rows as OrderItem[];
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [result] = await pool.query(
      'INSERT INTO order_items (order_id, product_id, name, price, quantity, type, customization) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        item.order_id,
        item.product_id || null,
        item.name,
        item.price,
        item.quantity,
        item.type,
        item.customization ? JSON.stringify(item.customization) : null
      ]
    );
    const id = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM order_items WHERE id = ?', [id]);
    return (rows as OrderItem[])[0];
  }

  // Order reviews related methods
  async getOrderReviews(orderId: number): Promise<OrderReview[]> {
    const [rows] = await pool.query('SELECT * FROM order_reviews WHERE order_id = ?', [orderId]);
    return rows as OrderReview[];
  }

  async getReviewsByJuniorBaker(juniorBakerId: number): Promise<OrderReview[]> {
    const [rows] = await pool.query('SELECT * FROM order_reviews WHERE junior_baker_id = ?', [juniorBakerId]);
    return rows as OrderReview[];
  }

  async getJuniorBakerAverageRating(juniorBakerId: number): Promise<number> {
    const [rows] = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM order_reviews WHERE junior_baker_id = ?',
      [juniorBakerId]
    );
    return (rows as any)[0].avg_rating || 0;
  }

  async createOrderReview(review: InsertOrderReview): Promise<OrderReview> {
    const [result] = await pool.query(
      'INSERT INTO order_reviews (order_id, customer_id, junior_baker_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
      [review.order_id, review.customer_id, review.junior_baker_id, review.rating, review.review_text || null]
    );
    const id = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM order_reviews WHERE id = ?', [id]);
    return (rows as OrderReview[])[0];
  }

  // Notifications related methods
  async getNotifications(userId: number): Promise<Notification[]> {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as Notification[];
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return (rows as any)[0].count;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, order_id, action_url, is_read) VALUES (?, ?, ?, ?, ?, ?, FALSE)',
      [
        notification.user_id,
        notification.title,
        notification.message,
        notification.type,
        notification.order_id || null,
        notification.action_url || null
      ]
    );
    const id = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
    return (rows as Notification[])[0];
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [id]);
    return (rows as Notification[])[0];
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return (result as any).affectedRows > 0;
  }

  // Order related methods
  async getOrders(): Promise<Order[]> {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows as Order[];
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return (rows as Order[])[0];
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    const [rows] = await pool.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
    return rows as Order[];
  }

  async getOrdersByMainBaker(bakerId: number): Promise<Order[]> {
    const [rows] = await pool.query('SELECT * FROM orders WHERE main_baker_id = ? ORDER BY created_at DESC', [bakerId]);
    return rows as Order[];
  }

  async getOrdersByJuniorBaker(bakerId: number): Promise<Order[]> {
    const [rows] = await pool.query('SELECT * FROM orders WHERE junior_baker_id = ? ORDER BY created_at DESC', [bakerId]);
    return rows as Order[];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [result] = await pool.query(
      'INSERT INTO orders (customer_id, main_baker_id, junior_baker_id, status, total_amount, payment_method, delivery_info) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        order.customer_id,
        order.main_baker_id || null,
        order.junior_baker_id || null,
        order.status || 'pending',
        order.total_amount,
        order.payment_method || 'credit_card',
        order.delivery_info ? JSON.stringify(order.delivery_info) : null
      ]
    );
    const id = (result as any).insertId;
    return this.getOrderById(id) as Promise<Order>;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    return this.getOrderById(id);
  }

  async assignOrderToBaker(orderId: number, mainBakerId?: number, juniorBakerId?: number): Promise<Order | undefined> {
    const updates = [];
    const values = [];
    
    if (mainBakerId !== undefined) {
      updates.push('main_baker_id = ?');
      values.push(mainBakerId);
    }
    if (juniorBakerId !== undefined) {
      updates.push('junior_baker_id = ?');
      values.push(juniorBakerId);
    }
    
    if (updates.length === 0) return this.getOrderById(orderId);
    
    updates.push('updated_at = NOW()');
    
    await pool.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      [...values, orderId]
    );
    return this.getOrderById(orderId);
  }
}

// Create all storage options
const memStorage = new MemStorage();
const mysqlStorage = new MySQLStorage();

// Initially use memory storage until we initialize
export let storage: IStorage = memStorage;

// Initialize storage - try different database connections based on environment
export async function initializeStorage() {
  try {
    // Try to connect to MySQL
    await pool.query("SELECT 1");
    console.log("✅ Database storage initialized successfully");
    console.log("✅ Using MySQL database for storage (local)");
    
    // Create MySQL storage implementation
    storage = new MySQLStorage();
  } catch (error) {
    console.log("⚠️ Failed to connect to MySQL, falling back to memory storage");
    storage = new MemStorage();
  }
}

import { users, User, InsertUser, categories, Category, InsertCategory, products, Product, InsertProduct, 
  orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, chatMessages, ChatMessage, 
  InsertChatMessage, bakerApplications, BakerApplication, InsertBakerApplication, orderReviews, 
  OrderReview, InsertOrderReview, notifications, Notification, InsertNotification } from "@shared/schema";
import session from "express-session";
import { getConnectionPool } from './database.mjs';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { default as expressMySQL } from 'express-mysql-session';

// Create MySQL session store 
const MySQLStore = expressMySQL(session);

export class DatabaseStorage implements IStorage {
  private pool: Pool | null;
  private sessionStoreInstance: any;

  constructor() {
    // Initialize pool as null, we'll set it in initialize()
    this.pool = null;
    this.sessionStoreInstance = null;
  }

  // Initialize database connection
  async initialize() {
    try {
      this.pool = await getConnectionPool();
      
      if (!this.pool) {
        console.error('Failed to create database connection pool');
        throw new Error('Database connection failed');
      }

      // Initialize session store with the MySQL connection
      const options = {
        createDatabaseTable: true,
        schema: {
          tableName: 'sessions',
          columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
          }
        }
      };
      
      this.sessionStoreInstance = new MySQLStore(options, this.pool);
      
      console.log('✅ Database storage initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database storage:', error);
      return false;
    }
  }

  get sessionStore() {
    if (!this.sessionStoreInstance) {
      throw new Error('Session store not initialized');
    }
    return this.sessionStoreInstance;
  }

  private async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }
    
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // User related methods
  async getUsers(): Promise<User[]> {
    return this.query<User>('SELECT * FROM users');
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await this.query<User>('SELECT * FROM users WHERE id = ?', [id]);
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.query<User>('SELECT * FROM users WHERE username = ?', [username]);
    return users[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.query<any>(
      'INSERT INTO users (username, password, email, fullName, role) VALUES (?, ?, ?, ?, ?)',
      [user.username, user.password, user.email || null, user.fullName || null, user.role || 'customer']
    );
    
    const id = result[0].insertId;
    return { id, ...user, created_at: new Date() };
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    await this.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    return this.getUser(userId);
  }

  // Category related methods
  async getCategories(): Promise<Category[]> {
    return this.query<Category>('SELECT * FROM categories');
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const categories = await this.query<Category>('SELECT * FROM categories WHERE id = ?', [id]);
    return categories[0];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await this.query<any>(
      'INSERT INTO categories (name, image) VALUES (?, ?)',
      [category.name, category.image || null]
    );
    
    const id = result[0].insertId;
    return { id, ...category };
  }

  // Product related methods
  async getProducts(): Promise<Product[]> {
    return this.query<Product>('SELECT * FROM products');
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const products = await this.query<Product>('SELECT * FROM products WHERE id = ?', [id]);
    return products[0];
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return this.query<Product>('SELECT * FROM products WHERE category_id = ?', [categoryId]);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.query<Product>('SELECT * FROM products WHERE is_featured = 1');
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await this.query<any>(
      'INSERT INTO products (name, image, description, price, category_id, is_featured, is_new) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        product.name, 
        product.image, 
        product.description, 
        product.price, 
        product.category_id, 
        product.is_featured || false, 
        product.is_new || false
      ]
    );
    
    const id = result[0].insertId;
    return { 
      id, 
      ...product, 
      created_at: new Date() 
    };
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    if (fields.length === 0) return this.getProductById(id);
    
    values.push(id);
    await this.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    
    return this.getProductById(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.query('DELETE FROM products WHERE id = ?', [id]);
    return result[0]?.affectedRows > 0;
  }

  // Order related methods
  async getOrders(): Promise<Order[]> {
    return this.query<Order>('SELECT * FROM orders');
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const orders = await this.query<Order>('SELECT * FROM orders WHERE id = ?', [id]);
    return orders[0];
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return this.query<Order>('SELECT * FROM orders WHERE customer_id = ?', [customerId]);
  }

  async getOrdersByMainBaker(bakerId: number): Promise<Order[]> {
    return this.query<Order>('SELECT * FROM orders WHERE main_baker_id = ?', [bakerId]);
  }

  async getOrdersByJuniorBaker(bakerId: number): Promise<Order[]> {
    return this.query<Order>('SELECT * FROM orders WHERE junior_baker_id = ?', [bakerId]);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await this.query<any>(
      'INSERT INTO orders (customer_id, main_baker_id, junior_baker_id, total_amount, status, payment_method, delivery_info) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        order.customer_id, 
        order.main_baker_id || null, 
        order.junior_baker_id || null, 
        order.total_amount, 
        order.status || 'pending', 
        order.payment_method || null,
        order.delivery_info ? JSON.stringify(order.delivery_info) : null
      ]
    );
    
    const id = result[0].insertId;
    return { 
      id, 
      ...order, 
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    await this.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', 
      [status, id]
    );
    return this.getOrderById(id);
  }

  async assignOrderToBaker(orderId: number, mainBakerId?: number, juniorBakerId?: number): Promise<Order | undefined> {
    const updates: any[] = [];
    const values: any[] = [];
    
    if (mainBakerId !== undefined) {
      updates.push('main_baker_id = ?');
      values.push(mainBakerId);
    }
    
    if (juniorBakerId !== undefined) {
      updates.push('junior_baker_id = ?');
      values.push(juniorBakerId);
    }
    
    if (updates.length === 0) {
      return this.getOrderById(orderId);
    }
    
    updates.push('updated_at = NOW()');
    values.push(orderId);
    
    await this.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, 
      values
    );
    
    return this.getOrderById(orderId);
  }

  // Order items related methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return this.query<OrderItem>('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await this.query<any>(
      'INSERT INTO order_items (order_id, product_id, name, type, price, quantity, customization) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        item.order_id, 
        item.product_id || null, 
        item.name, 
        item.type, 
        item.price, 
        item.quantity, 
        item.customization ? JSON.stringify(item.customization) : null
      ]
    );
    
    const id = result[0].insertId;
    return { ...item, id };
  }

  // Chat messages related methods
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    return this.query<ChatMessage>(
      'SELECT * FROM chat_messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp',
      [senderId, receiverId, receiverId, senderId]
    );
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await this.query<{count: number}>(
      'SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = ? AND `read` = 0',
      [userId]
    );
    return result[0]?.count || 0;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await this.query<any>(
      'INSERT INTO chat_messages (sender_id, receiver_id, order_id, content, `read`) VALUES (?, ?, ?, ?, ?)',
      [
        message.sender_id, 
        message.receiver_id, 
        message.order_id || null, 
        message.content, 
        false
      ]
    );
    
    const id = result[0].insertId;
    return { 
      id, 
      ...message, 
      read: false, 
      timestamp: new Date() 
    };
  }

  async markMessagesAsRead(messageIds: number[]): Promise<boolean> {
    if (messageIds.length === 0) return true;
    
    const placeholders = messageIds.map(() => '?').join(',');
    await this.query(
      `UPDATE chat_messages SET \`read\` = 1 WHERE id IN (${placeholders})`,
      messageIds
    );
    
    return true;
  }

  // Baker applications related methods
  async getBakerApplications(): Promise<BakerApplication[]> {
    return this.query<BakerApplication>('SELECT * FROM baker_applications');
  }

  async getBakerApplicationById(id: number): Promise<BakerApplication | undefined> {
    const apps = await this.query<BakerApplication>('SELECT * FROM baker_applications WHERE id = ?', [id]);
    return apps[0];
  }

  async getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]> {
    return this.query<BakerApplication>('SELECT * FROM baker_applications WHERE user_id = ?', [userId]);
  }

  async createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication> {
    const result = await this.query<any>(
      'INSERT INTO baker_applications (user_id, current_role, requested_role, reason, experience, preferred_main_baker_id, completed_orders) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        application.user_id, 
        application.current_role, 
        application.requested_role, 
        application.reason,
        application.experience || null,
        application.preferred_main_baker_id || null,
        application.completed_orders || 0
      ]
    );
    
    const id = result[0].insertId;
    return { 
      id, 
      ...application, 
      status: 'pending',
      created_at: new Date(),
      reviewed_at: null,
      reviewed_by: null
    };
  }

  async updateBakerApplicationStatus(id: number, status: string, reviewerId: number): Promise<BakerApplication | undefined> {
    await this.query(
      'UPDATE baker_applications SET status = ?, reviewed_at = NOW(), reviewed_by = ? WHERE id = ?',
      [status, reviewerId, id]
    );
    
    return this.getBakerApplicationById(id);
  }

  // Order reviews related methods
  async getOrderReviews(orderId: number): Promise<OrderReview[]> {
    return this.query<OrderReview>('SELECT * FROM order_reviews WHERE order_id = ?', [orderId]);
  }

  async getReviewsByJuniorBaker(juniorBakerId: number): Promise<OrderReview[]> {
    return this.query<OrderReview>('SELECT * FROM order_reviews WHERE junior_baker_id = ?', [juniorBakerId]);
  }

  async getJuniorBakerAverageRating(juniorBakerId: number): Promise<number> {
    const result = await this.query<{avg_rating: number}>(
      'SELECT AVG(rating) as avg_rating FROM order_reviews WHERE junior_baker_id = ?',
      [juniorBakerId]
    );
    
    return result[0]?.avg_rating || 0;
  }

  async createOrderReview(review: InsertOrderReview): Promise<OrderReview> {
    const result = await this.query<any>(
      'INSERT INTO order_reviews (order_id, customer_id, junior_baker_id, rating, review_text) VALUES (?, ?, ?, ?, ?)',
      [
        review.order_id, 
        review.customer_id, 
        review.junior_baker_id, 
        review.rating,
        review.review_text || null
      ]
    );
    
    const id = result[0].insertId;
    return {
      id,
      ...review,
      created_at: new Date()
    };
  }

  // Notifications related methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return this.query<Notification>(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await this.query<{count: number}>(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND `read` = 0',
      [userId]
    );
    
    return result[0]?.count || 0;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await this.query<any>(
      'INSERT INTO notifications (user_id, title, message, type, order_id, action_url) VALUES (?, ?, ?, ?, ?, ?)',
      [
        notification.user_id, 
        notification.title, 
        notification.message, 
        notification.type,
        notification.order_id || null,
        notification.action_url || null
      ]
    );
    
    const id = result[0].insertId;
    return {
      id,
      ...notification,
      read: false,
      created_at: new Date()
    };
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    await this.query('UPDATE notifications SET `read` = 1 WHERE id = ?', [id]);
    
    const notifications = await this.query<Notification>('SELECT * FROM notifications WHERE id = ?', [id]);
    return notifications[0];
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await this.query('UPDATE notifications SET `read` = 1 WHERE user_id = ?', [userId]);
    return true;
  }
}

import { IStorage } from './storage';
import { users, User, InsertUser, categories, Category, InsertCategory, products, Product, InsertProduct, 
  orders, Order, InsertOrder, orderItems, OrderItem, InsertOrderItem, chatMessages, ChatMessage, 
  InsertChatMessage, bakerApplications, BakerApplication, InsertBakerApplication, orderReviews, 
  OrderReview, InsertOrderReview, notifications, Notification, InsertNotification } from "@shared/schema";
import session from "express-session";
import { pool, db } from './db';
import { eq, and, desc } from 'drizzle-orm';
import { IStorage } from './storage';
import connectPg from "connect-pg-simple";

// Create PostgreSQL session store 
const PostgresStore = connectPg(session);

export class PostgresStorage implements IStorage {
  private sessionStoreInstance: any;

  constructor() {
    this.sessionStoreInstance = null;
  }

  // Initialize database connection
  async initialize() {
    try {
      // Initialize session store with PostgreSQL connection
      const options = {
        createTableIfMissing: true
      };
      
      this.sessionStoreInstance = new PostgresStore({
        ...options,
        pool: pool,
      });
      
      console.log('✅ PostgreSQL database storage initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize PostgreSQL database storage:', error);
      return false;
    }
  }

  get sessionStore() {
    if (!this.sessionStoreInstance) {
      throw new Error('Session store not initialized');
    }
    return this.sessionStoreInstance;
  }

  // User related methods
  async getUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting user with id ${id}:`, error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error(`Error getting user with username ${username}:`, error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values({
        ...user,
        created_at: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserRole(userId: number, role: string): Promise<User | undefined> {
    try {
      const result = await db.update(users)
        .set({ role })
        .where(eq(users.id, userId))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      return undefined;
    }
  }

  // Category related methods
  async getCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    try {
      const result = await db.select().from(categories).where(eq(categories.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting category with id ${id}:`, error);
      return undefined;
    }
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    try {
      const result = await db.insert(categories).values(category).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Product related methods
  async getProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async getProductById(id: number): Promise<Product | undefined> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting product with id ${id}:`, error);
      return undefined;
    }
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    try {
      return await db.select().from(products).where(eq(products.category_id, categoryId));
    } catch (error) {
      console.error(`Error getting products for category ${categoryId}:`, error);
      return [];
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products).where(eq(products.is_featured, true));
    } catch (error) {
      console.error('Error getting featured products:', error);
      return [];
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    try {
      const result = await db.insert(products).values({
        ...product,
        created_at: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    try {
      const result = await db.update(products)
        .set(updates)
        .where(eq(products.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const result = await db.delete(products)
        .where(eq(products.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      return false;
    }
  }

  // Order related methods
  async getOrders(): Promise<Order[]> {
    try {
      return await db.select().from(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    try {
      const result = await db.select().from(orders).where(eq(orders.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting order with id ${id}:`, error);
      return undefined;
    }
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    try {
      return await db.select().from(orders).where(eq(orders.customer_id, customerId));
    } catch (error) {
      console.error(`Error getting orders for customer ${customerId}:`, error);
      return [];
    }
  }

  async getOrdersByMainBaker(bakerId: number): Promise<Order[]> {
    try {
      return await db.select().from(orders).where(eq(orders.main_baker_id, bakerId));
    } catch (error) {
      console.error(`Error getting orders for main baker ${bakerId}:`, error);
      return [];
    }
  }

  async getOrdersByJuniorBaker(bakerId: number): Promise<Order[]> {
    try {
      return await db.select().from(orders).where(eq(orders.junior_baker_id, bakerId));
    } catch (error) {
      console.error(`Error getting orders for junior baker ${bakerId}:`, error);
      return [];
    }
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    try {
      const now = new Date();
      const result = await db.insert(orders).values({
        ...order,
        created_at: now,
        updated_at: now
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const result = await db.update(orders)
        .set({ 
          status,
          updated_at: new Date()
        })
        .where(eq(orders.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating status for order ${id}:`, error);
      return undefined;
    }
  }

  async assignOrderToBaker(orderId: number, mainBakerId?: number, juniorBakerId?: number): Promise<Order | undefined> {
    try {
      // Get the order first
      const order = await this.getOrderById(orderId);
      if (!order) return undefined;

      // Prepare updates
      const updates: Partial<Order> = {
        updated_at: new Date()
      };

      if (mainBakerId !== undefined) {
        updates.main_baker_id = mainBakerId;
      }

      if (juniorBakerId !== undefined) {
        updates.junior_baker_id = juniorBakerId;
      }

      // If we're assigning, update status to assigned
      if ((mainBakerId || juniorBakerId) && order.status === 'pending') {
        updates.status = 'assigned';
      }

      const result = await db.update(orders)
        .set(updates)
        .where(eq(orders.id, orderId))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error assigning bakers to order ${orderId}:`, error);
      return undefined;
    }
  }

  // Order items related methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    try {
      return await db.select().from(orderItems).where(eq(orderItems.order_id, orderId));
    } catch (error) {
      console.error(`Error getting items for order ${orderId}:`, error);
      return [];
    }
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    try {
      const result = await db.insert(orderItems).values(item).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating order item:', error);
      throw error;
    }
  }

  // Chat messages related methods
  async getChatMessages(senderId: number, receiverId: number): Promise<ChatMessage[]> {
    try {
      return await db.select().from(chatMessages)
        .where(
          and(
            (eq(chatMessages.sender_id, senderId) && eq(chatMessages.receiver_id, receiverId)) ||
            (eq(chatMessages.sender_id, receiverId) && eq(chatMessages.receiver_id, senderId))
          )
        )
        .orderBy(chatMessages.timestamp);
    } catch (error) {
      console.error(`Error getting chat messages between ${senderId} and ${receiverId}:`, error);
      return [];
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const result = await db.select().from(chatMessages)
        .where(
          and(
            eq(chatMessages.receiver_id, userId),
            eq(chatMessages.read, false)
          )
        );
      return result.length;
    } catch (error) {
      console.error(`Error getting unread messages count for user ${userId}:`, error);
      return 0;
    }
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    try {
      const result = await db.insert(chatMessages).values({
        ...message,
        read: false,
        timestamp: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating chat message:', error);
      throw error;
    }
  }

  async markMessagesAsRead(messageIds: number[]): Promise<boolean> {
    try {
      for (const id of messageIds) {
        await db.update(chatMessages)
          .set({ read: true })
          .where(eq(chatMessages.id, id));
      }
      return true;
    } catch (error) {
      console.error(`Error marking messages as read:`, error);
      return false;
    }
  }

  // Baker applications related methods
  async getBakerApplications(): Promise<BakerApplication[]> {
    try {
      return await db.select().from(bakerApplications);
    } catch (error) {
      console.error('Error getting baker applications:', error);
      return [];
    }
  }

  async getBakerApplicationById(id: number): Promise<BakerApplication | undefined> {
    try {
      const result = await db.select().from(bakerApplications).where(eq(bakerApplications.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting baker application with id ${id}:`, error);
      return undefined;
    }
  }

  async getBakerApplicationsByUser(userId: number): Promise<BakerApplication[]> {
    try {
      return await db.select().from(bakerApplications).where(eq(bakerApplications.user_id, userId));
    } catch (error) {
      console.error(`Error getting baker applications for user ${userId}:`, error);
      return [];
    }
  }

  async createBakerApplication(application: InsertBakerApplication): Promise<BakerApplication> {
    try {
      const result = await db.insert(bakerApplications).values({
        ...application,
        status: 'pending',
        created_at: new Date(),
        completed_orders: 0,
        reviewed_at: null,
        reviewed_by: null
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating baker application:', error);
      throw error;
    }
  }

  async updateBakerApplicationStatus(id: number, status: string, reviewerId: number): Promise<BakerApplication | undefined> {
    try {
      const result = await db.update(bakerApplications)
        .set({ 
          status,
          reviewed_at: new Date(),
          reviewed_by: reviewerId
        })
        .where(eq(bakerApplications.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error updating status for baker application ${id}:`, error);
      return undefined;
    }
  }

  // Order reviews related methods
  async getOrderReviews(orderId: number): Promise<OrderReview[]> {
    try {
      return await db.select().from(orderReviews).where(eq(orderReviews.order_id, orderId));
    } catch (error) {
      console.error(`Error getting reviews for order ${orderId}:`, error);
      return [];
    }
  }

  async getReviewsByJuniorBaker(juniorBakerId: number): Promise<OrderReview[]> {
    try {
      return await db.select().from(orderReviews).where(eq(orderReviews.junior_baker_id, juniorBakerId));
    } catch (error) {
      console.error(`Error getting reviews for junior baker ${juniorBakerId}:`, error);
      return [];
    }
  }

  async getJuniorBakerAverageRating(juniorBakerId: number): Promise<number> {
    try {
      const reviews = await this.getReviewsByJuniorBaker(juniorBakerId);
      if (reviews.length === 0) return 0;
      
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / reviews.length;
    } catch (error) {
      console.error(`Error calculating average rating for junior baker ${juniorBakerId}:`, error);
      return 0;
    }
  }

  async createOrderReview(review: InsertOrderReview): Promise<OrderReview> {
    try {
      const result = await db.insert(orderReviews).values({
        ...review,
        created_at: new Date()
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating order review:', error);
      throw error;
    }
  }

  // Notifications related methods
  async getNotifications(userId: number): Promise<Notification[]> {
    try {
      return await db.select().from(notifications)
        .where(eq(notifications.user_id, userId))
        .orderBy(desc(notifications.created_at));
    } catch (error) {
      console.error(`Error getting notifications for user ${userId}:`, error);
      return [];
    }
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    try {
      const result = await db.select().from(notifications)
        .where(
          and(
            eq(notifications.user_id, userId),
            eq(notifications.read, false)
          )
        );
      return result.length;
    } catch (error) {
      console.error(`Error getting unread notifications count for user ${userId}:`, error);
      return 0;
    }
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    try {
      const result = await db.insert(notifications).values({
        ...notification,
        created_at: new Date(),
        read: false
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    try {
      const result = await db.update(notifications)
        .set({ read: true })
        .where(eq(notifications.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
      return undefined;
    }
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    try {
      await db.update(notifications)
        .set({ read: true })
        .where(
          and(
            eq(notifications.user_id, userId),
            eq(notifications.read, false)
          )
        );
      return true;
    } catch (error) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error);
      return false;
    }
  }
}
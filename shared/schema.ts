import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role-based access control
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").notNull().default("customer"),
  created_at: timestamp("created_at").defaultNow(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  image: text("image"),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  image: text("image").notNull(),
  category_id: integer("category_id").notNull(),
  is_featured: boolean("is_featured").default(false),
  is_new: boolean("is_new").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Order status enum
export const orderStatuses = [
  "pending", 
  "assigned", 
  "in_progress", 
  "completed", 
  "ready_for_delivery", 
  "delivered", 
  "cancelled"
] as const;

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customer_id: integer("customer_id").notNull(),
  main_baker_id: integer("main_baker_id"),
  junior_baker_id: integer("junior_baker_id"),
  status: text("status").notNull().default("pending"),
  total_amount: doublePrecision("total_amount").notNull(),
  payment_method: text("payment_method").default("credit_card"),
  delivery_info: jsonb("delivery_info"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  product_id: integer("product_id"),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(), // 'product', 'custom_cake', 'custom_chocolate'
  customization: jsonb("customization"),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sender_id: integer("sender_id").notNull(),
  receiver_id: integer("receiver_id").notNull(),
  order_id: integer("order_id"), // Link to specific order
  content: text("content").notNull(),
  read: boolean("read").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Order reviews table
export const orderReviews = pgTable("order_reviews", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id").notNull(),
  customer_id: integer("customer_id").notNull(),
  junior_baker_id: integer("junior_baker_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 star rating
  review_text: text("review_text"),
  created_at: timestamp("created_at").defaultNow(),
});

// Baker applications table
export const bakerApplications = pgTable("baker_applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  current_role: text("current_role").notNull(),
  requested_role: text("requested_role").notNull(),
  preferred_main_baker_id: integer("preferred_main_baker_id"),
  experience: text("experience"),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected'
  created_at: timestamp("created_at").defaultNow(),
  reviewed_at: timestamp("reviewed_at"),
  reviewed_by: integer("reviewed_by"),
  completed_orders: integer("completed_orders").default(0),
});

// Schema for inserting users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
});

// Schema for inserting categories
export const insertCategorySchema = createInsertSchema(categories);

// Schema for inserting products
export const insertProductSchema = createInsertSchema(products);

// Schema for inserting orders
export const insertOrderSchema = createInsertSchema(orders);

// Schema for inserting order items
export const insertOrderItemSchema = createInsertSchema(orderItems);

// Schema for inserting chat messages
export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sender_id: true,
  receiver_id: true,
  order_id: true,
  content: true,
});

// Schema for inserting baker applications
export const insertBakerApplicationSchema = createInsertSchema(bakerApplications).pick({
  user_id: true,
  current_role: true,
  requested_role: true,
  preferred_main_baker_id: true,
  experience: true,
  reason: true,
});

// Custom cake schema
export const customCakeSchema = z.object({
  shape: z.string(),
  size: z.string(),
  flavor: z.string(),
  filling: z.string(),
  frosting: z.string(),
  message: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'order_received', 'status_update', 'chat_message', 'application_status', etc.
  order_id: integer("order_id"),
  read: boolean("read").default(false),
  action_url: text("action_url"),
  created_at: timestamp("created_at").defaultNow(),
});

// Schema for inserting notifications
export const insertNotificationSchema = createInsertSchema(notifications).pick({
  user_id: true,
  title: true,
  message: true,
  type: true,
  order_id: true,
  action_url: true,
});

// Schema for inserting order reviews
export const insertOrderReviewSchema = createInsertSchema(orderReviews).pick({
  order_id: true,
  customer_id: true,
  junior_baker_id: true,
  rating: true,
  review_text: true,
});

// Custom chocolate schema
export const customChocolateSchema = z.object({
  shape: z.string(),
  size: z.string(),
  flavor: z.string(),
  filling: z.string().optional(),
  packaging: z.string(),
  message: z.string().optional(),
  specialInstructions: z.string().optional(),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type BakerApplication = typeof bakerApplications.$inferSelect;
export type InsertBakerApplication = z.infer<typeof insertBakerApplicationSchema>;

export type CustomCake = z.infer<typeof customCakeSchema>;
export type CustomChocolate = z.infer<typeof customChocolateSchema>;

export type OrderReview = typeof orderReviews.$inferSelect;
export type InsertOrderReview = z.infer<typeof insertOrderReviewSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

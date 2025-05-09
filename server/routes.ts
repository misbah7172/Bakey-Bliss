import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertOrderSchema, insertOrderItemSchema, insertChatMessageSchema, insertBakerApplicationSchema, customCakeSchema, customChocolateSchema, insertOrderReviewSchema, insertNotificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes and middleware
  const { checkRole } = setupAuth(app);

  // Create HTTP server for WebSocket support
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Map to store connected clients by user ID
  const clients = new Map<number, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    // Message handling
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'authenticate') {
          // Store client connection with user ID
          clients.set(data.userId, ws);
          console.log(`User ${data.userId} authenticated via WebSocket`);
        } else if (data.type === 'chat_message') {
          // Store message in database
          const newMessage = await storage.createChatMessage({
            sender_id: data.senderId,
            receiver_id: data.receiverId,
            order_id: data.orderId || null,
            content: data.content
          });
          
          // Send message to receiver if they are connected
          const receiverSocket = clients.get(data.receiverId);
          if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
            receiverSocket.send(JSON.stringify({
              type: 'new_message',
              message: newMessage
            }));
          }
          
          // Send confirmation back to sender
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: newMessage
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      // Remove client from the clients map
      for (const [userId, socket] of clients.entries()) {
        if (socket === ws) {
          clients.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategoryById(id);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      
      let products;
      if (category) {
        const categoryObj = (await storage.getCategories()).find(c => c.name === category);
        if (categoryObj) {
          products = await storage.getProductsByCategory(categoryObj.id);
        } else {
          products = [];
        }
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Admin product management routes
  app.post("/api/admin/products", checkRole("admin"), async (req, res) => {
    try {
      const newProduct = await storage.createProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", checkRole("admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedProduct = await storage.updateProduct(id, req.body);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", checkRole("admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to place an order" });
    }
    
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        customer_id: req.user.id
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      const orderItemsPromises = req.body.items.map((item: any) => 
        storage.createOrderItem({
          ...item,
          order_id: order.id
        })
      );
      
      const orderItems = await Promise.all(orderItemsPromises);
      
      res.status(201).json({ order, items: orderItems });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      let orders;
      
      // Filter orders based on user role
      switch (req.user.role) {
        case "admin":
          orders = await storage.getOrders();
          break;
        case "main_baker":
          orders = await storage.getOrdersByMainBaker(req.user.id);
          break;
        case "junior_baker":
          orders = await storage.getOrdersByJuniorBaker(req.user.id);
          break;
        default: // customer
          orders = await storage.getOrdersByCustomer(req.user.id);
      }
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return { ...order, items };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has permission to access this order
      const isCustomer = order.customer_id === req.user.id;
      const isAssignedBaker = order.main_baker_id === req.user.id || order.junior_baker_id === req.user.id;
      const isAdmin = req.user.role === "admin";
      
      if (!isCustomer && !isAssignedBaker && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission to access this order" });
      }
      
      const items = await storage.getOrderItems(order.id);
      
      res.json({ ...order, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has permission to update this order
      const isAssignedBaker = order.main_baker_id === req.user.id || order.junior_baker_id === req.user.id;
      const isAdmin = req.user.role === "admin";
      
      if (!isAssignedBaker && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission to update this order" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      
      // Create notification for customer about status update
      if (order.customer_id) {
        await storage.createNotification({
          user_id: order.customer_id,
          title: "Order Status Updated",
          message: `Your order #${id} status has been updated to ${status}`,
          type: "status_update",
          order_id: id,
          action_url: `/dashboard?order=${id}`
        });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Endpoint to get order delivery info
  app.get("/api/orders/:id/delivery-info", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has permission to access this order
      const isCustomer = order.customer_id === req.user.id;
      const isAssignedBaker = order.main_baker_id === req.user.id || order.junior_baker_id === req.user.id;
      const isAdmin = req.user.role === "admin";
      
      if (!isCustomer && !isAssignedBaker && !isAdmin) {
        return res.status(403).json({ message: "You don't have permission to access this order" });
      }
      
      // Return delivery info from order, or default empty object if not present
      res.json(order.delivery_info || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch delivery information" });
    }
  });

  app.put("/api/baker/orders/:id/assign", checkRole(["main_baker", "admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { juniorBakerId } = req.body;
      
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Assign main baker if not already assigned
      let mainBakerId = order.main_baker_id;
      if (!mainBakerId && req.user.role === "main_baker") {
        mainBakerId = req.user.id;
      }
      
      const updatedOrder = await storage.assignOrderToBaker(id, mainBakerId, juniorBakerId);
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign order" });
    }
  });

  // Chat messages routes
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const otherUserId = parseInt(req.query.otherUserId as string);
      
      if (isNaN(otherUserId)) {
        return res.status(400).json({ message: "Valid otherUserId is required" });
      }
      
      const messages = await storage.getChatMessages(req.user.id, otherUserId);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        sender_id: req.user.id
      });
      
      // Get receiver info
      const receiver = await storage.getUser(messageData.receiver_id);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      // Check if messaging is allowed based on roles
      const senderRole = req.user.role;
      const receiverRole = receiver.role;
      
      // If order_id is provided, verify that both users are related to this order
      if (messageData.order_id) {
        const order = await storage.getOrderById(messageData.order_id);
        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }
        
        // Determine if sender is related to the order
        const isSenderRelated = 
          (senderRole === "customer" && order.customer_id === req.user.id) ||
          (senderRole === "junior_baker" && order.junior_baker_id === req.user.id) ||
          (senderRole === "main_baker" && order.main_baker_id === req.user.id) ||
          senderRole === "admin";
        
        // Determine if receiver is related to the order
        const isReceiverRelated = 
          (receiverRole === "customer" && order.customer_id === receiver.id) ||
          (receiverRole === "junior_baker" && order.junior_baker_id === receiver.id) ||
          (receiverRole === "main_baker" && order.main_baker_id === receiver.id) ||
          receiverRole === "admin";
        
        if (!isSenderRelated || !isReceiverRelated) {
          return res.status(403).json({ message: "You can only message users related to this order" });
        }
      } else {
        // Without order_id, apply role-based restrictions
        
        // Customer can only message junior_baker or main_baker with order context
        if (senderRole === "customer") {
          return res.status(400).json({ message: "Customers can only message bakers about specific orders" });
        }
        
        // Junior baker can only message main baker without order context for promotion/general questions
        if (senderRole === "junior_baker" && receiverRole !== "main_baker" && receiverRole !== "admin") {
          return res.status(403).json({ message: "Junior bakers can only message main bakers or admins without order context" });
        }
        
        // Main baker can message junior bakers or admins
        if (senderRole === "main_baker" && receiverRole !== "junior_baker" && receiverRole !== "admin") {
          return res.status(403).json({ message: "Main bakers can only message junior bakers or admins without order context" });
        }
      }
      
      const message = await storage.createChatMessage(messageData);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/api/messages/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.post("/api/messages/mark-read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const { messageIds } = req.body;
      
      if (!Array.isArray(messageIds) || messageIds.length === 0) {
        return res.status(400).json({ message: "Valid messageIds array is required" });
      }
      
      const success = await storage.markMessagesAsRead(messageIds);
      
      if (success) {
        res.json({ success: true });
      } else {
        res.status(400).json({ message: "Some messages could not be marked as read" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Baker application routes
  app.post("/api/baker-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const applicationData = insertBakerApplicationSchema.parse({
        ...req.body,
        user_id: req.user.id,
        current_role: req.user.role
      });
      
      // Check if there's a pending application
      const userApplications = await storage.getBakerApplicationsByUser(req.user.id);
      const pendingApplication = userApplications.find(app => app.status === "pending");
      
      if (pendingApplication) {
        return res.status(400).json({ 
          message: "You already have a pending application",
          application: pendingApplication
        });
      }
      
      const application = await storage.createBakerApplication(applicationData);
      
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get("/api/baker-applications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      // If admin, return all applications
      // Otherwise, return only user's applications
      const applications = req.user.role === "admin" 
        ? await storage.getBakerApplications()
        : await storage.getBakerApplicationsByUser(req.user.id);
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put("/api/admin/baker-applications/:id", checkRole("admin"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Valid status (approved or rejected) is required" });
      }
      
      const application = await storage.getBakerApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const updatedApplication = await storage.updateBakerApplicationStatus(id, status, req.user.id);
      
      // If approved, update the user's role
      if (status === "approved") {
        await storage.updateUserRole(application.user_id, application.requested_role);
      }
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });
  
  // Order review routes
  app.get("/api/reviews/order/:id", async (req, res) => {
    const orderId = parseInt(req.params.id);
    const reviews = await storage.getOrderReviews(orderId);
    res.json(reviews);
  });
  
  app.get("/api/reviews/juniorBaker/:id", async (req, res) => {
    const juniorBakerId = parseInt(req.params.id);
    const reviews = await storage.getReviewsByJuniorBaker(juniorBakerId);
    res.json(reviews);
  });
  
  app.get("/api/reviews/juniorBaker/:id/averageRating", async (req, res) => {
    const juniorBakerId = parseInt(req.params.id);
    const averageRating = await storage.getJuniorBakerAverageRating(juniorBakerId);
    res.json({ averageRating });
  });
  
  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const reviewData = insertOrderReviewSchema.parse(req.body);
      
      // Check if order exists and belongs to the customer
      const order = await storage.getOrderById(reviewData.order_id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.customer_id !== req.user.id) {
        return res.status(403).json({ message: "You can only review your own orders" });
      }
      
      // Check if order is delivered (can only review completed orders)
      if (order.status !== "delivered") {
        return res.status(400).json({ message: "You can only review delivered orders" });
      }
      
      // Check if already reviewed
      const existingReviews = await storage.getOrderReviews(order.id);
      if (existingReviews.length > 0) {
        return res.status(400).json({ message: "Order already reviewed" });
      }
      
      const review = await storage.createOrderReview(reviewData);
      
      // Create notification for the junior baker
      if (order.junior_baker_id) {
        await storage.createNotification({
          user_id: order.junior_baker_id,
          type: "review",
          title: "New Review",
          message: `Your order #${order.id} has been reviewed by a customer.`
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      res.status(400).json({ message: errorMessage });
    }
  });
  
  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const notifications = await storage.getNotifications(req.user.id);
    res.json(notifications);
  });
  
  app.get("/api/notifications/unread-count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const count = await storage.getUnreadNotificationsCount(req.user.id);
    res.json({ count });
  });
  
  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const notificationId = parseInt(req.params.id);
    const notification = await storage.markNotificationAsRead(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ message: "You can only mark your own notifications as read" });
    }
    
    res.json(notification);
  });
  
  app.post("/api/notifications/read-all", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const success = await storage.markAllNotificationsAsRead(req.user.id);
    res.json({ success });
  });

  // Custom cake validation endpoint
  app.post("/api/validate/custom-cake", (req, res) => {
    try {
      const validatedData = customCakeSchema.parse(req.body);
      res.json({ valid: true, data: validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ valid: false, errors: error.errors });
      }
      res.status(500).json({ message: "Validation error" });
    }
  });

  // Custom chocolate validation endpoint
  app.post("/api/validate/custom-chocolate", (req, res) => {
    try {
      const validatedData = customChocolateSchema.parse(req.body);
      res.json({ valid: true, data: validatedData });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ valid: false, errors: error.errors });
      }
      res.status(500).json({ message: "Validation error" });
    }
  });

  return httpServer;
}

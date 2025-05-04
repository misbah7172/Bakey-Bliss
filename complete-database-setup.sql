-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS order_reviews;
DROP TABLE IF EXISTS baker_applications;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  fullName VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(255)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  main_baker_id INT,
  junior_baker_id INT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  delivery_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (main_baker_id) REFERENCES users(id),
  FOREIGN KEY (junior_baker_id) REFERENCES users(id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  customization JSON,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  order_id INT,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read BOOLEAN DEFAULT false,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create baker_applications table
CREATE TABLE IF NOT EXISTS baker_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  current_role VARCHAR(50) NOT NULL,
  requested_role VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  experience TEXT,
  preferred_main_baker_id INT,
  completed_orders INT DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by INT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (preferred_main_baker_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Create order_reviews table
CREATE TABLE IF NOT EXISTS order_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  customer_id INT NOT NULL,
  junior_baker_id INT NOT NULL,
  rating INT NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id),
  FOREIGN KEY (junior_baker_id) REFERENCES users(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN DEFAULT false,
  order_id INT,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (username, password, email, fullName, role)
VALUES ('admin', '$2b$10$ECgVRYrY7DBIl5YgGtJy2OH/BwOhdnVBsW0NQO.6WT8B/DQzXnV3i', 'admin@bakerybliss.com', 'Administrator', 'admin');

-- Insert sample categories
INSERT INTO categories (name, image) VALUES
('Bread & Loaves', 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'),
('Cakes', 'https://images.unsplash.com/photo-1562777717-dc6984f65a6d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'),
('Pastries', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80'),
('Cookies', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80'),
('Chocolates', 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80');

-- Insert sample products
INSERT INTO products (name, image, description, price, category_id, is_featured, is_new)
VALUES 
('Artisan Sourdough Bread', 'https://images.unsplash.com/photo-1585478259715-1c195a3c231a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80', 
'Our signature sourdough bread, made with organic flour and a 100-year-old starter. Perfect for sandwiches or alongside soups.', 
6.99, 1, true, false),

('Chocolate Cake', 'https://images.unsplash.com/photo-1602351447937-745cb720612f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=686&q=80', 
'Rich chocolate cake with layers of chocolate ganache and chocolate buttercream frosting.', 
28.99, 2, true, false),

('Buttery Croissant', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1426&q=80', 
'Light and flaky croissants made with premium European butter. Baked fresh daily.', 
3.49, 3, false, true),

('Chocolate Chip Cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', 
'Classic chocolate chip cookies with semi-sweet chocolate chips and a hint of sea salt.', 
1.99, 4, true, false),

('Handcrafted Truffles', 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', 
'Assorted chocolate truffles handcrafted with premium chocolate and filled with ganache.', 
12.99, 5, true, true),

('Whole Grain Bread', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1472&q=80', 
'Nutritious whole grain bread made with a blend of 7 different grains and seeds.', 
5.99, 1, false, false),

('Red Velvet Cake', 'https://images.unsplash.com/photo-1586788224331-947f68671cf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80', 
'Moist red velvet cake with cream cheese frosting. Available in various sizes.', 
32.99, 2, false, true),

('Pain au Chocolat', 'https://images.unsplash.com/photo-1623334044303-241021148943?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', 
'Buttery croissant dough filled with high-quality dark chocolate. A French classic.', 
3.99, 3, true, false),

('Oatmeal Raisin Cookies', 'https://images.unsplash.com/photo-1490567674333-4eae047fbc79?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80', 
'Soft and chewy oatmeal cookies loaded with raisins and a hint of cinnamon.', 
1.99, 4, false, false),

('Chocolate-Dipped Strawberries', 'https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80', 
'Fresh strawberries dipped in Belgian chocolate. Available in dark, milk, or white chocolate.', 
9.99, 5, true, false);

-- Insert sample junior baker and main baker users
INSERT INTO users (username, password, email, fullName, role)
VALUES 
('junior_baker', '$2b$10$ECgVRYrY7DBIl5YgGtJy2OH/BwOhdnVBsW0NQO.6WT8B/DQzXnV3i', 'junior@bakerybliss.com', 'Junior Baker', 'junior_baker'),
('main_baker', '$2b$10$ECgVRYrY7DBIl5YgGtJy2OH/BwOhdnVBsW0NQO.6WT8B/DQzXnV3i', 'main@bakerybliss.com', 'Main Baker', 'main_baker'),
('customer', '$2b$10$ECgVRYrY7DBIl5YgGtJy2OH/BwOhdnVBsW0NQO.6WT8B/DQzXnV3i', 'customer@bakerybliss.com', 'Test Customer', 'customer');

-- Insert sample order
INSERT INTO orders (customer_id, main_baker_id, junior_baker_id, total_amount, status, payment_method, delivery_info)
VALUES (4, 3, 2, 42.97, 'in_progress', 'cash_on_delivery', '{"address": "123 Main St", "city": "Bakersville", "zipCode": "12345", "phone": "555-123-4567", "specialInstructions": "Please leave at the door."}');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, name, type, price, quantity, customization)
VALUES 
(1, 2, 'Chocolate Cake', 'product', 28.99, 1, NULL),
(1, 8, 'Pain au Chocolat', 'product', 3.99, 2, NULL),
(1, 4, 'Chocolate Chip Cookies', 'product', 1.99, 3, NULL);

-- Insert sample chat messages
INSERT INTO chat_messages (sender_id, receiver_id, order_id, content, read)
VALUES 
(4, 2, 1, 'Hello, I was wondering when my order will be ready?', true),
(2, 4, 1, 'Hi there! Your chocolate cake is in the oven now. It should be ready for pickup tomorrow at 2pm.', false);

-- Insert sample notification
INSERT INTO notifications (user_id, title, message, type, order_id, action_url)
VALUES 
(4, 'Order Status Update', 'Your order #1 is now in progress. Our junior baker has started working on it!', 'order_update', 1, '/customer-dashboard');
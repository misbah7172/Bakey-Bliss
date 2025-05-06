-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  full_name VARCHAR(100),
  role ENUM('customer', 'admin', 'main_baker', 'junior_baker') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
) ENGINE=InnoDB;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image VARCHAR(255),
  category_id INT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  main_baker_id INT,
  junior_baker_id INT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'credit_card',
  delivery_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (main_baker_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (junior_baker_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  type VARCHAR(20) NOT NULL DEFAULT 'product',
  customization JSON,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  order_id INT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Baker applications table
CREATE TABLE IF NOT EXISTS baker_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reviewer_id INT,
  current_baker_role VARCHAR(20) NOT NULL,
  requested_role VARCHAR(20) NOT NULL,
  experience TEXT,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  order_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Order reviews table
CREATE TABLE IF NOT EXISTS order_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  customer_id INT NOT NULL,
  junior_baker_id INT NOT NULL,
  rating INT NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (junior_baker_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Check if categories table is empty before inserting
INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Bread & Loaves' AS name, 'Freshly baked bread and loaves' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Bread & Loaves'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Cakes & Pastries' AS name, 'Delicious cakes and pastries for all occasions' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Cakes & Pastries'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Cookies & Biscuits' AS name, 'Sweet treats perfect with tea or coffee' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Cookies & Biscuits'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Pies & Tarts' AS name, 'Savory and sweet pies and tarts' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Pies & Tarts'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Doughnuts & Croissants' AS name, 'Light and fluffy breakfast favorites' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Doughnuts & Croissants'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Savory Items' AS name, 'Savory baked goods for lunch or dinner' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Savory Items'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Custom Chocolates' AS name, 'Handmade chocolates customized to your preference' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Custom Chocolates'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Seasonal & Special Items' AS name, 'Limited edition seasonal items' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Seasonal & Special Items'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (
  SELECT 'Beverages' AS name, 'Hot and cold drinks to accompany your treats' AS description
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM categories WHERE name = 'Beverages'
) LIMIT 1;

-- Check if admin user exists before inserting
INSERT INTO users (username, password, email, full_name, role)
SELECT * FROM (
  SELECT 'admin' AS username, '$2b$10$EZl1iX/jN5e0qEZWiV8AeeKQ4Ro6qzH02wBXJkGf.M70Jxl8QERQm' AS password, 
         'admin@bakerybliss.com' AS email, 'Admin User' AS full_name, 'admin' AS role
) AS tmp
WHERE NOT EXISTS (
  SELECT username FROM users WHERE username = 'admin'
) LIMIT 1;

-- Check if sample products exist before inserting
INSERT INTO products (name, description, price, image, category_id, is_featured, is_new)
SELECT * FROM (
  SELECT 'Sourdough Bread' AS name, 'Traditional sourdough bread with a crispy crust' AS description, 
         5.99 AS price, '/images/sourdough.jpg' AS image, 
         (SELECT id FROM categories WHERE name = 'Bread & Loaves' LIMIT 1) AS category_id, 
         TRUE AS is_featured, FALSE AS is_new
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM products WHERE name = 'Sourdough Bread'
) LIMIT 1;

INSERT INTO products (name, description, price, image, category_id, is_featured, is_new)
SELECT * FROM (
  SELECT 'Chocolate Cake' AS name, 'Decadent chocolate cake with rich ganache' AS description, 
         24.99 AS price, '/images/chocolate-cake.jpg' AS image, 
         (SELECT id FROM categories WHERE name = 'Cakes & Pastries' LIMIT 1) AS category_id, 
         TRUE AS is_featured, FALSE AS is_new
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM products WHERE name = 'Chocolate Cake'
) LIMIT 1;

INSERT INTO products (name, description, price, image, category_id, is_featured, is_new)
SELECT * FROM (
  SELECT 'Chocolate Chip Cookies' AS name, 'Classic cookies with chunks of chocolate' AS description, 
         3.99 AS price, '/images/choc-chip-cookies.jpg' AS image, 
         (SELECT id FROM categories WHERE name = 'Cookies & Biscuits' LIMIT 1) AS category_id, 
         FALSE AS is_featured, TRUE AS is_new
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM products WHERE name = 'Chocolate Chip Cookies'
) LIMIT 1;

INSERT INTO products (name, description, price, image, category_id, is_featured, is_new)
SELECT * FROM (
  SELECT 'Apple Pie' AS name, 'Traditional apple pie with cinnamon and flaky crust' AS description, 
         18.99 AS price, '/images/apple-pie.jpg' AS image, 
         (SELECT id FROM categories WHERE name = 'Pies & Tarts' LIMIT 1) AS category_id, 
         TRUE AS is_featured, FALSE AS is_new
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM products WHERE name = 'Apple Pie'
) LIMIT 1;

INSERT INTO products (name, description, price, image, category_id, is_featured, is_new)
SELECT * FROM (
  SELECT 'Almond Croissant' AS name, 'Buttery croissant filled with almond cream' AS description, 
         4.50 AS price, '/images/almond-croissant.jpg' AS image, 
         (SELECT id FROM categories WHERE name = 'Doughnuts & Croissants' LIMIT 1) AS category_id, 
         FALSE AS is_featured, FALSE AS is_new
) AS tmp
WHERE NOT EXISTS (
  SELECT name FROM products WHERE name = 'Almond Croissant'
) LIMIT 1;
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Database configuration for XAMPP (C:\xampp)
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP password is empty
  port: 3306,
  socketPath: process.platform === 'win32' ? null : undefined // Allow XAMPP to be found on Windows
};

// Database name
const DB_NAME = 'bakerybliss';

// Path to SQL script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQL_SCRIPT_PATH = path.join(__dirname, 'database_setup.sql');

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Checking database connection...');
    
    // First connect without database to check if database exists
    connection = await mysql.createConnection(dbConfig);
    
    // Check if database exists
    const [rows] = await connection.execute(`SHOW DATABASES LIKE '${DB_NAME}'`);
    
    if (rows.length === 0) {
      console.log(`⚠️ Database "${DB_NAME}" does not exist. Creating it...`);
      
      // Create database
      await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
      console.log(`✅ Database "${DB_NAME}" created successfully!`);
      
      // Connect to the new database
      await connection.changeUser({ database: DB_NAME });
      
      // Read SQL script
      const sqlScript = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');
      
      // Split script by semicolons to execute each statement
      const statements = sqlScript.split(';').filter(stmt => stmt.trim());
      
      console.log('🔄 Setting up database tables and initial data...');
      
      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
      
      console.log('✅ Database setup completed successfully!');
    } else {
      console.log(`✅ Database "${DB_NAME}" already exists!`);
    }
    
    // Return config with database
    const config = {
      ...dbConfig,
      database: DB_NAME
    };
    
    // For the setupDatabase function, we'll return true to indicate success
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    // Don't throw error, just return null
    // This allows the application to continue running without database
    // when in environments without MySQL (e.g., Replit)
    return null;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        // Ignore connection end errors
      }
    }
  }
}

// Get a database connection pool for the application
async function getConnectionPool() {
  const config = await setupDatabase();
  
  // If config is null, database setup failed
  // Return null instead of creating a pool
  if (!config) {
    console.log('⚠️ Running without MySQL database. Using in-memory storage instead.');
    return null;
  }
  
  return mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

export {
  setupDatabase,
  getConnectionPool,
  DB_NAME
};
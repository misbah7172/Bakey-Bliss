import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bakerybliss',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export { pool };
export const db = pool;

import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Khai báo type cho biến môi trường để tránh undefined
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env as {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
};

// Tạo connection pool với type rõ ràng
const pool: Pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

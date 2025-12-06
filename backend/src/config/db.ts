import mysql from 'mysql2';
import dotenv from 'dotenv';

// Kích hoạt biến môi trường
dotenv.config();

// Tạo kết nối
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Xuất pool ra ngoài (Không gọi .promise() ở đây để bên route tự gọi)
export default pool;
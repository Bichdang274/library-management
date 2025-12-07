import mysql from 'mysql2/promise'; // Đã sửa thành mysql2/promise
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng mysql.createPool từ module promise
const pool = mysql.createPool({ 
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, // Mật khẩu được truyền vào đúng cách
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Không cần pool.promise() nữa vì pool đã là Promise API
const db = pool; 

export default db;

console.log("DB_PASS =", process.env.DB_PASS);
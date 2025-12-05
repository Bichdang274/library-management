import mysql, { Pool } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Tạo kết nối với kiểu dữ liệu Pool
const db: Pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26082006', // <-- Mật khẩu của bạn
    database: 'librarymanagement',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kiểm tra kết nối
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Kết nối Database thất bại: ', err.message);
    } else {
        console.log('✅ Kết nối MySQL thành công!');
        connection.release(); // Giải phóng kết nối sau khi kiểm tra xong
    }
});

export default db;
import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '26082006', // <--- Nhớ điền mật khẩu của bạn vào đây
    database: 'librarymanagement',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Kết nối Database thất bại: ', err.message);
    } else {
        console.log('✅ Kết nối MySQL thành công!');
        connection.release();
    }
});

export default db; // Thay đổi từ module.exports sang export default
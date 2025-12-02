import type { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise'; 
const UserModel = require('../models/userModel');
const ManagerModel = require('../models/managerModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db: Pool = require('../config/db'); 

interface RegisterUserData {
    name: string;
    email: string;
    password: string;
    phone_number?: string;
    address?: string;
}


interface Manager {
    manager_id: number | string; 
    email: string;
    password_hash: string;
    name: string;
}

interface UserResult {
    user_id: number | string;
    password_hash: string;
    quota: number;
    email: string;
    name: string;
    role: 'reader' | 'admin'; 
}


exports.registerUser = async (userData: RegisterUserData) => { 
    const { name, email, password, phone_number, address } = userData;
    const connection: PoolConnection = await db.getConnection(); 
    
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query<RowDataPacket[]>(
            'SELECT reader_id FROM readers WHERE email = ?', 
            [email]
        );
        if (existing.length > 0) {
            throw new Error('Email đã tồn tại');
        }
        

        const [readerResult] = await connection.query<ResultSetHeader>(
            `INSERT INTO readers (name, email, phone_number, address) 
             VALUES (?, ?, ?, ?)`,
            [name, email, phone_number, address]
        );
        const newReaderId = readerResult.insertId;

        const salt: string = await bcrypt.genSalt(10);
        const passwordHash: string = await bcrypt.hash(password, salt);

        await connection.query(
            `INSERT INTO users (user_id, password_hash, quota) 
             VALUES (?, ?, ?)`,
            [newReaderId, passwordHash, 5]
        );

        await connection.commit();
        
        return { 
            success: true, 
            message: "Đăng ký thành công", 
            userId: newReaderId 
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release(); 
    }
};



exports.login = async (email: string, password: string) => {
    let account: Manager | UserResult | null = null;
    let role: 'reader' | 'admin' | '' = '';
    let dbPassword = '';
    let id: number | string | null = null;
    let name = '';

    const manager: Manager | undefined = await ManagerModel.findByEmail(email);
    if (manager) {
        account = manager;
        role = 'admin';
        dbPassword = manager.password_hash;
        id = manager.manager_id;
        name = manager.name;
    } else {
        // 2. Kiểm tra bảng User
        const user: UserResult | undefined = await UserModel.findByEmail(email);
        if (user) {
            account = user;
            role = 'reader';
            dbPassword = user.password_hash;
            id = user.user_id;
            name = user.name;
        }
    }

    if (!account) throw new Error('Tài khoản không tồn tại');


    const isBcryptMatch: boolean = await bcrypt.compare(password, dbPassword);
    const isPlainMatch: boolean = (password === dbPassword); 

    if (!isBcryptMatch && !isPlainMatch) {
        throw new Error('Sai mật khẩu');
    }


    if (!id || !role || !name) {
        throw new Error('Thiếu thông tin người dùng để tạo token.');
    }

    const token = jwt.sign(
        { id, role, name },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );


    return { token, user: { id, name, email, role } };
};
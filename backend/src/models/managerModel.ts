
interface Manager {
    id: number;
    email: string;
    password_hash: string;
    name?: string;
}

const db = require('../config/db');

class ManagerModel {
    static async findByEmail(email: string): Promise<Manager | undefined> { 
        const sql = `SELECT * FROM managers WHERE email = ?`;
        const [rows] = await db.execute(sql, [email]);
        return (rows as Manager[])[0];
    }
}
module.exports = ManagerModel;
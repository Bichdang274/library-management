import ReaderModel from '../models/readerModel';
import bcrypt from 'bcryptjs';

// --- INTERFACES ĐỒNG BỘ ---

interface CreateReaderData {
    name: string;
    email: string;
    password: string; 
    quota?: number;
    phone_number?: string;
    address?: string;
}

interface UpdateReaderData {
    name?: string;
    email?: string;
    password?: string; 
    quota?: number | string;
    phone_number?: string;
    address?: string;
}

// --- HÀM LOGIC XỬ LÝ ---

const readerService = {
    getReaders: async () => {
        return await ReaderModel.getAll();
    },

    createReader: async (data: CreateReaderData) => {
        // 1. Hashing mật khẩu
        const salt: string = await bcrypt.genSalt(10);
        const passwordHash: string = await bcrypt.hash(data.password, salt);

        // 2. Gọi Model (truyền null nếu optional)
        return await ReaderModel.create({
            name: data.name,
            email: data.email,
            phone_number: data.phone_number || null, 
            address: data.address || null,         
            password_hash: passwordHash,
            quota: data.quota || 5
        });
    },

    updateReader: async (id: number | string, data: UpdateReaderData) => {
        const dataToUpdate: any = { ...data };

        // 1. Nếu có mật khẩu mới, hash nó
        if (data.password) {
            const salt: string = await bcrypt.genSalt(10);
            dataToUpdate.password_hash = await bcrypt.hash(data.password, salt);
            delete dataToUpdate.password; 
        }
        
        // 2. Chuyển các trường phone/address thành null nếu rỗng
        if (dataToUpdate.phone_number === '') dataToUpdate.phone_number = null;
        if (dataToUpdate.address === '') dataToUpdate.address = null;

        // 3. Gọi Model để thực hiện update
        return await ReaderModel.update(id, dataToUpdate);
    },

    deleteReader: async (id: number | string) => {
        return await ReaderModel.delete(id);
    }
};

// FIX: Xuất toàn bộ đối tượng Service
export default readerService;
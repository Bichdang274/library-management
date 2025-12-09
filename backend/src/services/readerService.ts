import ReaderModel from '../models/readerModel';
import bcrypt from 'bcryptjs';

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

const readerService = {
    getReaders: async () => {
        return await ReaderModel.getAll();
    },

    createReader: async (data: CreateReaderData) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

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

        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password_hash = await bcrypt.hash(data.password, salt);
            delete dataToUpdate.password; 
        }
        
        if (dataToUpdate.phone_number === '') dataToUpdate.phone_number = null;
        if (dataToUpdate.address === '') dataToUpdate.address = null;

        return await ReaderModel.update(id, dataToUpdate);
    },

    deleteReader: async (id: number | string) => {
        return await ReaderModel.delete(id);
    }
};

export default readerService;
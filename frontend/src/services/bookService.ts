import api from './api';
import type { Book } from '../types';


export const getBooks = async (keyword: string = '', categoryId: number = 0): Promise<Book[]> => {
    // Gọi API dạng: /books?search=Harry&category=2
    const response = await api.get<Book[]>('/books', {
        params: {
            search: keyword,
            category: categoryId
        }
    });
    return response.data;
};


export const createBook = async (bookData: FormData): Promise<void> => {
    await api.post('/books', bookData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};


export const updateBook = async (id: number, bookData: FormData): Promise<void> => {
    await api.put(`/books/${id}`, bookData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};


export const deleteBook = async (id: number): Promise<void> => {
    await api.delete(`/books/${id}`);
};
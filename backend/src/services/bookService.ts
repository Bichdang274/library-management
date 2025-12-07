// frontend/src/services/bookService.ts
import api from './api';

// Lưu ý: bookData bây giờ là object bình thường, không phải FormData
export const getBooks = async (search = '', category_id = 0) => {
    const params: any = {};
    if (search) params.search = search;
    if (category_id > 0) params.category_id = category_id;

    const res = await api.get('/books', { params });
    return res.data; 
};

export const createBook = async (bookData: any) => {
    const res = await api.post('/books', bookData);
    return res.data;
};

export const updateBook = async (id: number | string, bookData: any) => {
    const res = await api.put(`/books/${id}`, bookData);
    return res.data;
};

export const deleteBook = async (id: number | string) => {
    const res = await api.delete(`/books/${id}`);
    return res.data;
};
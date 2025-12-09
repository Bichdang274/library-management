import api from './api';

export const getActiveLoans = async () => {
    const res = await api.get('/transactions/active');
    return res.data;
};

export const createLoan = async (data: { reader_id: string | number, book_id: string | number, due_date: string }) => {
    const res = await api.post('/transactions/borrow', data);
    return res.data;
};

export const returnBook = async (data: { borrow_id: number, book_id: number }) => {
    const res = await api.post('/transactions/return', data);
    return res.data;
};

export const getReaderHistory = async (readerId: number) => {
    const res = await api.get(`/transactions/history/${readerId}`);
    return res.data;
};
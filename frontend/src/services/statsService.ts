import api from './api';

export const getStats = async () => {
    const res = await api.get('/stats');
    return res.data;
};

export const getBorrowsByMonth = async () => {
    const res = await api.get('/stats/borrows-by-month');
    return res.data;
};

export const getBorrowsByGenre = async () => {
    const res = await api.get('/stats/borrows-by-genre');
    return res.data;
};

export const getTopBooks = async () => {
    const res = await api.get('/stats/top-books');
    return res.data;
};

export const getTopReaders = async () => {
    const res = await api.get('/stats/top-readers');
    return res.data;
};
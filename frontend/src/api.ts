import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const getHealth = () => api.get<{ ok: boolean }>('/health');


export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
}
export const getBooks = () => api.get<Book[]>('/books');
export const addBook = (book: { title: string; author: string; year: number }) =>
  api.post<Book>('/books', book);


export interface Borrowing {
  id: number;
  book_id: number;
  reader_id: number;
  borrow_date: string;
  return_date: string | null;
}
export const getBorrows = () => api.get<Borrowing[]>('/borrows');


export const getStats = () => api.get<{ total_books: number }>('/stats');


export interface BorrowByMonth {
  ym: string;
  total: number;
}
export const getBorrowsByMonth = () =>
  api.get<{ data: BorrowByMonth[] }>('/borrows-by-month');

export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Health
export const getHealth = () => api.get<{ status: string }>('/health');

// Books
export interface Book {
  book_id: number;
  name: string;
  author: string;
  publisher?: string;
  year_published: number;
  category_id: number;
  total_copies: number;
  available_copies: number;
}
export const getBooks = () => api.get<Book[]>('/books');
export const addBook = (book: { name: string; author: string; year_published: number }) =>
  api.post<Book>('/books', book);

// Borrowings
export interface Borrowing {
  id: number;
  book_id: number;
  reader_id: number;
  borrow_date: string;
  return_date: string | null;
}
export const getBorrows = () => api.get<Borrowing[]>('/borrows');

// Stats
export const getStats = () => api.get<{ totalBooks: number; totalBorrows: number; totalReaders: number; currentBorrows: number }>('/stats');

// Borrowings by month
export interface BorrowByMonth {
  ym: string;
  total: number;
}
export const getBorrowsByMonth = () =>
  api.get<{ data: BorrowByMonth[] }>('/borrows-by-month');

// Borrowings by genre
export interface BorrowByGenre {
  genre: string;
  total: number;
}
export const getBorrowsByGenre = () =>
  api.get<{ data: BorrowByGenre[] }>('/borrows-by-genre');

// Top books
export const getTopBooks = () => api.get<{ title: string; borrow_count: number }[]>('/stats/top-books');

// Top readers
export const getTopReaders = () => api.get<{ topReaders: { reader: string; borrow_count: number }[]; mostActiveReader: { reader: string; borrow_count: number } }>('/stats/top-readers');

export default api;

import React, { useEffect, useState } from 'react';
import type { Book, Category } from '../../types';
import { getBooks, deleteBook } from '../../services/bookService';
import { getCategories } from '../../services/categoryService';
import BookForm from './BookForm';
import '../../styles/BooksPage.css';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [filterCategory, setFilterCategory] = useState(0);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const data = await getBooks(searchKeyword, filterCategory);
            setBooks(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCategories().then(setCategories).catch(console.error);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchBooks(), 300);
        return () => clearTimeout(timer);
    }, [searchKeyword, filterCategory]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sách này không?')) {
            try {
                await deleteBook(id);
                fetchBooks();
            } catch (error) {
                alert('Không thể xóa sách này (có thể đang được mượn).');
            }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 className="vintage-title" style={{ borderBottom: '2px solid #5D4037', paddingBottom: '10px', marginBottom: '20px' }}>
                DANH SÁCH & QUẢN LÝ SÁCH
            </h2>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Tìm theo tên sách hoặc tác giả..." 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ flex: 1, padding: '10px', border: '1px solid #8D6E63', borderRadius: '4px' }}
                />
                <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(Number(e.target.value))}
                    style={{ padding: '10px', border: '1px solid #8D6E63', borderRadius: '4px', minWidth: '200px' }}
                >
                    <option value={0}>-- Tất cả thể loại --</option>
                    {categories.map(c => (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                </select>
                <button 
                    onClick={() => { setSearchKeyword(''); setFilterCategory(0); }}
                    style={{ padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '20px', backgroundColor: '#5D4037', color: '#fff' }}
                >
                    Xóa lọc
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
                <div>
                    <BookForm 
                        onSuccess={() => { fetchBooks(); setEditingBook(null); }} 
                        initialData={editingBook}
                        onCancel={() => setEditingBook(null)}
                    />
                </div>

                <div className="vintage-card">
                    {loading ? <p>Đang tải...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#EFEBE0', color: '#5D4037' }}>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Ảnh</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Tên Sách</th>
                                    <th style={{ padding: '10px', textAlign: 'left' }}>Thể loại</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Năm</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Kho</th>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book: Book) => (
                                    <tr key={book.book_id} style={{ borderBottom: '1px solid #D7CCC8' }}>
                                        <td style={{ padding: '10px' }}>
                                            {book.image_url ? (
                                                <img 
                                                    src={book.image_url} 
                                                    alt="Cover" 
                                                    style={{ width: '50px', height: '70px', objectFit: 'cover', border: '1px solid #ddd' }}
                                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x70?text=No+Img'}
                                                />
                                            ) : (
                                                <div style={{ width: '50px', height: '70px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>No Img</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#3E2723' }}>
                                            {book.name}
                                            <div style={{ fontWeight: 'normal', fontSize: '12px', color: '#666' }}>{book.author}</div>
                                        </td>
                                        <td style={{ padding: '10px' }}>{book.category_name}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{book.year_published}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <span style={{ backgroundColor: book.available_copies > 0 ? '#E8F5E9' : '#FFEBEE', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
                                                {book.available_copies} / {book.total_copies}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button 
                                                    onClick={() => setEditingBook(book)} 
                                                    className="btn-icon edit" 
                                                    title="Sửa"
                                                >
                                                    ✎
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(book.book_id)} 
                                                    className="btn-icon delete" 
                                                    title="Xóa"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookList;
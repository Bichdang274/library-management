import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Home.css';


interface Book {
    book_id: number | string;
    name: string;
    author: string;
    publisher: string;
    year_published: number;
    total_copies: number;
    available_copies: number; // <--- Đã thêm trường này
    image_url?: string;
}

const Home: React.FC = () => {
    const { user, logout } = useContext(AuthContext) as AuthContextType;
    const [books, setBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    const DEFAULT_IMAGE = "https://via.placeholder.com/300x400?text=No+Image";

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            let realDataFromDB: Book[] = [];
            // Kiểm tra cấu trúc dữ liệu trả về từ API
            if (res.data && Array.isArray(res.data.data)) realDataFromDB = res.data.data;
            else if (Array.isArray(res.data)) realDataFromDB = res.data;

            setBooks(realDataFromDB);
        } catch (error) {
            console.error("Lỗi tải sách:", error);
        } finally {
            setLoadingBooks(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    // --- Styles ---
    const styles = {
        gridContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '25px',
            padding: '20px 0'
        },
        bookCard: {
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            height: '280px',
            border: '1px solid #eee'
        },
        bookImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover' as const,
            display: 'block'
        },
        modalOverlay: {
            position: 'fixed' as const,
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '700px',
            width: '100%',
            display: 'flex',
            flexDirection: 'row' as const,
            overflow: 'hidden',
            position: 'relative' as const,
            boxShadow: '0 20px 25px rgba(0,0,0,0.2)'
        },
        modalImageSide: {
            width: '40%',
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #eee'
        },
        modalInfoSide: {
            width: '60%',
            padding: '40px 30px',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center'
        },
        closeButton: {
            position: 'absolute' as const,
            top: '10px',
            right: '15px',
            fontSize: '30px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#999',
            zIndex: 10
        },
        infoRow: {
            marginBottom: '15px',
            fontSize: '16px',
            color: '#333',
            borderBottom: '1px dashed #eee',
            paddingBottom: '8px'
        },
        label: {
            fontWeight: 'bold',
            color: '#555',
            marginRight: '10px',
            minWidth: '130px', // Tăng độ rộng nhãn một chút cho đẹp
            display: 'inline-block'
        }
    };

    return (
        <div className="container">
            <div className="header">
                <h2>
                     LIB 
                </h2>
                <div className="user-control">
                    <span style={{marginRight: '15px'}}> <b>{user?.name}</b></span>
                    <button onClick={logout} className="btn-logout">Đăng xuất</button>
                </div>
            </div>

            <div className="content-body">
                <h3 className="section-title">DANH MỤC SÁCH</h3>
                
                {loadingBooks ? (
                    <div style={{textAlign:'center', padding: '20px'}}>Đang tải dữ liệu...</div>
                ) : (
                    <div style={styles.gridContainer}>
                        {books.map(book => (
                            <div 
                                key={book.book_id} 
                                style={styles.bookCard}
                                onClick={() => setSelectedBook(book)}
                                title={book.name}
                            >
                                <img 
                                    src={book.image_url || DEFAULT_IMAGE} 
                                    alt={book.name} 
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                    }}
                                    style={styles.bookImage}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT */}
            {selectedBook && (
                <div style={styles.modalOverlay} onClick={() => setSelectedBook(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeButton} onClick={() => setSelectedBook(null)}>&times;</button>
                        
                        <div style={styles.modalImageSide}>
                             <img 
                                src={selectedBook.image_url || DEFAULT_IMAGE} 
                                alt={selectedBook.name} 
                                style={{width: '100%', height: '100%', objectFit: 'contain', maxHeight: '400px'}}
                            />
                        </div>

                        <div style={styles.modalInfoSide}>
                            <h2 style={{marginTop: 0, color: '#2c3e50', marginBottom: '25px', lineHeight: '1.3'}}>
                                {selectedBook.name}
                            </h2>
                            
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Tác giả:</span> 
                                {selectedBook.author}
                            </div>
                            
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Nhà xuất bản:</span> 
                                {selectedBook.publisher}
                            </div>
                            
                            <div style={styles.infoRow}>
                                <span style={styles.label}>Năm xuất bản:</span> 
                                {selectedBook.year_published}
                            </div>
                            
                            {/* 2. CẬP NHẬT HIỂN THỊ: Hiện available_copies */}
                            <div style={{...styles.infoRow, borderBottom: 'none'}}>
                                <span style={styles.label}>Sách còn trong kho:</span> 
                                <span style={{
                                    fontWeight: 'bold', 
                                    // Logic màu: Nếu > 0 thì Xanh, bằng 0 thì Đỏ
                                    color: selectedBook.available_copies > 0 ? '#28a745' : '#dc3545'
                                }}>
                                    {selectedBook.available_copies} cuốn
                                </span>
                            </div>

                            <button 
                                className="btn-borrow" 
                                disabled={selectedBook.available_copies === 0} // Vô hiệu hóa nút nếu hết sách
                                style={{
                                    marginTop: 'auto', 
                                    padding: '12px', 
                                    // Đổi màu nút sang xám nếu hết sách
                                    backgroundColor: selectedBook.available_copies > 0 ? '#007bff' : '#ccc', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    fontSize: '16px', 
                                    cursor: selectedBook.available_copies > 0 ? 'pointer' : 'not-allowed', 
                                    fontWeight: 'bold'
                                }}
                            >
                                {selectedBook.available_copies > 0 ? 'Đăng ký mượn' : 'Hết sách'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
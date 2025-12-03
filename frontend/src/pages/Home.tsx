import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Home.css';


const BOOK_METADATA: Record<number, { img: string; desc: string }> = {
    1: {
        img: "https://upload.wikimedia.org/wikipedia/en/d/de/Dune-Frank_Herbert_%281965%29_First_edition.jpg",
        desc: "Dune là kiệt tác viễn tưởng về cuộc chiến giành quyền kiểm soát hành tinh sa mạc Arrakis. Câu chuyện pha trộn giữa chính trị, tôn giáo và sinh thái học."
    },
    2: {
        img: "https://upload.wikimedia.org/wikipedia/en/6/6b/Harry_Potter_and_the_Philosopher%27s_Stone_Book_Cover.jpg",
        desc: "Harry Potter, một cậu bé mồ côi, khám phá ra thân phận phù thủy của mình và bắt đầu năm học đầy phép thuật và nguy hiểm tại trường Hogwarts."
    },
    3: {
        img: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1436202607i/3735293.jpg",
        desc: "Clean Code (Mã Sạch) là cuốn sách gối đầu giường cho mọi lập trình viên. Robert C. Martin hướng dẫn cách viết code dễ đọc, dễ bảo trì và chuyên nghiệp."
    },
    4: {
        img: "https://m.media-amazon.com/images/I/713jIoMO3UL.jpg",
        desc: "Sapiens tóm lược lịch sử nhân loại từ thời kỳ đồ đá. Yuval Noah Harari giải thích cách loài người thống trị thế giới thông qua các cuộc cách mạng nhận thức."
    },
    5: {
        img: "https://upload.wikimedia.org/wikipedia/en/4/4a/TheHobbit_FirstEdition.jpg",
        desc: "Cuộc phiêu lưu của Bilbo Baggins - một người Hobbit thích an nhàn bị cuốn vào hành trình giành lại kho báu từ rồng Smaug cùng pháp sư Gandalf."
    }
};



interface Book {
    book_id: number | string;
    name: string;
    author: string;
    publisher: string;
    year_published: number;
    category_id: number | string;
    total_copies: number;
    image_url?: string;
    description?: string;
}

const BookItem: React.FC<{ book: Book; isExpanded: boolean; handleToggleDetails: (id: any) => void }> = ({ book, isExpanded, handleToggleDetails }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(isExpanded ? contentRef.current.scrollHeight : 0);
        }
    }, [isExpanded]);

    return (
        <React.Fragment>
            <tr className={`book-row ${isExpanded ? 'expanded' : ''}`} onClick={() => handleToggleDetails(book.book_id)}>
                <td>
                    <img 
                        src={book.image_url} 
                        alt={book.name} 
                        className="book-image"
                        style={{width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd'}} 
                    />
                </td>
                <td style={{fontWeight: 'bold', color: '#333'}}>{book.name}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.year_published}</td>
                <td className="arrow-icon">{isExpanded ? '▲' : '▼'}</td>
            </tr>
            <tr className="details-row">
                <td colSpan={6} style={{padding: 0, border: 'none'}}>
                    <div ref={contentRef} className="details-wrapper" style={{ height: `${height}px`, overflow: 'hidden', transition: 'height 0.3s ease' }}>
                        <div className="details-content" style={{padding: '20px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #e9ecef'}}>
                            <h4 style={{marginTop: 0, color: '#2c3e50'}}>Giới thiệu nội dung:</h4>
                            <p className="details-desc" style={{fontStyle: 'italic', color: '#555', lineHeight: '1.6'}}>
                                {book.description}
                            </p>
                            <div style={{marginTop: '15px'}}>
                                <span style={{backgroundColor: '#e2e6ea', padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem'}}>
                                    📦 Tồn kho: <strong>{book.total_copies}</strong> cuốn
                                </span>
                            </div>
                            <button className="btn-borrow" style={{marginTop: '15px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}>
                                + Thêm vào giỏ sách
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        </React.Fragment>
    );
};

const Home: React.FC = () => {
    const { user, logout } = useContext(AuthContext) as AuthContextType;
    const [books, setBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [expandedBookId, setExpandedBookId] = useState<number | string | null>(null);

    const handleToggleDetails = useCallback((bookId: number | string) => {
        setExpandedBookId(prevId => (prevId === bookId ? null : bookId));
    }, []);

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            let realDataFromDB: Book[] = [];
            
            if (res.data && Array.isArray(res.data.data)) realDataFromDB = res.data.data;
            else if (Array.isArray(res.data)) realDataFromDB = res.data;


            const mergedData = realDataFromDB.map(book => {
                const id = Number(book.book_id); 
                const meta = BOOK_METADATA[id];  
                if (id === 3) console.log("Found Clean Code! Meta:", meta);
                return {
                    ...book,
                    image_url: meta ? meta.img : 'https://via.placeholder.com/60x90?text=No+Img',
                    description: meta ? meta.desc : `Mô tả cho sách "${book.name}" đang được cập nhật.`
                };
            });

            setBooks(mergedData);
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoadingBooks(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <div className="container">
            <div className="header">
                <h2>📚 Thư viện Online</h2>
                <div className="user-control">
                    <span style={{marginRight: '15px'}}>Xin chào, <b>{user?.name}</b></span>
                    <button onClick={logout} className="btn-logout">Đăng xuất</button>
                </div>
            </div>

            <div className="content-body">
                <h3 className="section-title">DANH MỤC SÁCH HIỆN CÓ</h3>
                {loadingBooks ? <div style={{textAlign:'center'}}>Đang tải...</div> : (
                    <div className="table-wrapper">
                        <table className="book-table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th><th>Tên sách</th><th>Tác giả</th><th>NXB</th><th>Năm XB</th><th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <BookItem 
                                        key={book.book_id} 
                                        book={book} 
                                        isExpanded={expandedBookId === book.book_id} 
                                        handleToggleDetails={handleToggleDetails} 
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
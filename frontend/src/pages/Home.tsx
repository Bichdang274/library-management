import React, { useContext, useEffect, useState } from 'react';
import { AuthContext, type AuthContextType } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Home.css';

interface Book {
    book_id: number;
    name: string;
    author: string;
    publisher: string;
    year_published: number;
    total_copies: number;
    available_copies: number;
    image_url?: string;
    category_name?: string;
}

interface Transaction {
    borrow_id: number;
    book_name: string;
    borrow_date: string;
    due_date: string;
    return_date: string | null;
    status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

interface TopBook { title: string; borrow_count: number; }
interface TopReader { reader: string; borrow_count: number; }


const Home: React.FC = () => {
    const { user, logout } = useContext(AuthContext) as AuthContextType;
    const [books, setBooks] = useState<Book[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    

    const [selectedBook, setSelectedBook] = useState<Book | null>(null);


    const [cart, setCart] = useState<Book[]>([]);
    const [showCart, setShowCart] = useState(false);


    const [history, setHistory] = useState<Transaction[]>([]);
    const [showHistory, setShowHistory] = useState(false);


    const [topBooks, setTopBooks] = useState<TopBook[]>([]);
    const [topReaders, setTopReaders] = useState<TopReader[]>([]);

    const DEFAULT_IMAGE = "https://via.placeholder.com/300x400?text=No+Image";


    const fetchBooks = async () => {
        try {
            const res = await api.get('/books'); 
            let realData: Book[] = [];
            if (res.data && Array.isArray(res.data)) realData = res.data;
            else if (res.data && Array.isArray(res.data.data)) realData = res.data.data;
            setBooks(realData);
        } catch (error) {
            console.error("Lỗi tải sách:", error);
        } finally {
            setLoadingBooks(false);
        }
    };


    const fetchHistory = async () => {
        if (!user) return;
        try {
        
            const res = await api.get(`/transactions/history/${user.id}`); 
            setHistory(res.data);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        }
    };


    const fetchTopLists = async () => {
        try {
        
            const bookRes = await api.get('/stats/top-books');
            setTopBooks(bookRes.data);

        
            const readerRes = await api.get('/stats/top-readers');
        
            setTopReaders(readerRes.data.topReaders); 

        } catch (error) {
            console.error("Lỗi tải Top Lists:", error);
        }
    };



    useEffect(() => {
        fetchBooks();
        fetchTopLists();
    }, []);

    useEffect(() => {
        if (showHistory) fetchHistory();
    }, [showHistory]);


    const addToCart = (book: Book) => {
        if (cart.find(item => item.book_id === book.book_id)) {
            alert("Sách này đã có trong giỏ!");
            return;
        }
        if (book.available_copies <= 0) {
            alert("Sách này đã hết hàng!");
            return;
        }
        setCart([...cart, book]);
        alert(`Đã thêm "${book.name}" vào giỏ!`);
    };

    const removeFromCart = (bookId: number) => {
        setCart(cart.filter(item => item.book_id !== bookId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!user) {
            alert("Vui lòng đăng nhập để mượn sách!");
            return;
        }

        if (!window.confirm(`Xác nhận mượn ${cart.length} cuốn sách này?`)) return;

        try {
            const bookIds = cart.map(b => b.book_id);
            await api.post('/transactions/checkout', { 
                reader_id: user.id, 
                book_ids: bookIds 
            });
            
            alert("Mượn sách thành công! Vui lòng đến thư viện để nhận sách.");
            setCart([]);
            setShowCart(false);
            fetchBooks();
        } catch (error: any) {
            alert("Lỗi mượn sách: " + (error.response?.data?.message || "Có lỗi xảy ra"));
        }
    };



    const styles = {
        gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px', padding: '20px 0' },
        bookCard: { cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: '#fff', height: '320px', border: '1px solid #eee', display: 'flex', flexDirection: 'column' as const },
        bookImage: { width: '100%', height: '200px', objectFit: 'cover' as const },
        bookInfo: { padding: '10px', flex: 1, display: 'flex', flexDirection: 'column' as const, justifyContent: 'space-between' },
        modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' as const, padding: '20px', position: 'relative' as const },
        closeBtn: { position: 'absolute' as const, top: '10px', right: '15px', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' },
        table: { width: '100%', borderCollapse: 'collapse' as const, marginTop: '10px' },
        th: { backgroundColor: '#f8f9fa', padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'left' as const },
        td: { padding: '12px', borderBottom: '1px solid #dee2e6' },
        btnAction: { padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' as const, color: 'white' }
    };

    return (
        <div className="container">
            {/* --- HEADER --- */}
            <div className="header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 30px', backgroundColor:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                    {/* Sử dụng màu vintage từ yêu cầu cá nhân hóa */}
                    <h2 style={{margin:0, color:'#5D4037'}}>LIB</h2> 
                    <div style={{display:'flex', gap:'15px'}}>
                        <button onClick={() => setShowCart(true)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center'}}>
                            Giỏ sách (<b style={{color:'#d32f2f'}}>{cart.length}</b>)
                        </button>
                        <button onClick={() => setShowHistory(true)} style={{background:'none', border:'none', cursor:'pointer', fontSize:'16px'}}>
                            Lịch sử
                        </button>
                    </div>
                </div>
                
                <div className="user-control">
                    <span style={{marginRight: '15px'}}>Xin chào, <b>{user?.name}</b></span>
                    <button onClick={logout} className="btn-logout">Đăng xuất</button>
                </div>
            </div>

            <div className="content-body" style={{padding:'30px'}}>
                
                {/* --- TOP 5 SÁCH HOT & MỌT SÁCH (Phần đã thêm) --- */}
                <h3 className="section-title" style={{color:'#5D4037'}}>THỐNG KÊ NỔI BẬT</h3>
                <div className="charts-row" style={{display:'flex', gap:'25px', marginBottom:'30px'}}> 
                    
                    {/* TOP 5 SÁCH HOT */}
                    <div className="chart-box" style={{flex:1, padding:'20px', borderRadius:'8px', backgroundColor:'#FAF8F1', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                        <h2 style={{color:'#4E342E', marginTop:0}}>Top 5 Sách Hot</h2>
                        <ul className="top-list" style={{listStyle:'none', padding:0}}>
                            {topBooks.length === 0 ? <p style={{color:'#795548'}}>Đang tải...</p> : topBooks.map((book, idx) => (
                                <li key={idx} className={idx === 0 ? 'highlight' : ''} style={{padding:'10px 0', borderBottom:'1px dotted #ccc', display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight: idx === 0 ? 'bold' : 'normal'}}>
                                    <span className={idx === 0 ? 'rank-badge' : 'rank'} style={{backgroundColor: idx === 0 ? '#8D6E63' : 'transparent', color: idx === 0 ? 'white' : '#212121', padding: '2px 8px', borderRadius: '4px', marginRight: '10px'}}>{`#${idx + 1}`}</span>
                                    <span className="item-title" style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{book.title}</span>
                                    <span className="item-count" style={{color:'#4E342E'}}>{book.borrow_count} lượt</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* TOP 5 MỌT SÁCH */}
                    <div className="chart-box" style={{flex:1, padding:'20px', borderRadius:'8px', backgroundColor:'#FAF8F1', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                        <h2 style={{color:'#4E342E', marginTop:0}}>Top 5 Mọt Sách</h2>
                        <ul className="top-list" style={{listStyle:'none', padding:0}}>
                            {topReaders.length === 0 ? <p style={{color:'#795548'}}>Đang tải...</p> : topReaders.map((reader, idx) => (
                                <li key={idx} className={idx === 0 ? 'highlight' : ''} style={{padding:'10px 0', borderBottom:'1px dotted #ccc', display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight: idx === 0 ? 'bold' : 'normal'}}>
                                    <span className={idx === 0 ? 'rank-badge' : 'rank'} style={{backgroundColor: idx === 0 ? '#8D6E63' : 'transparent', color: idx === 0 ? 'white' : '#212121', padding: '2px 8px', borderRadius: '4px', marginRight: '10px'}}>{`#${idx + 1}`}</span>
                                    <span className="item-title" style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{reader.reader}</span>
                                    <span className="item-count" style={{color:'#4E342E'}}>{reader.borrow_count} lượt</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>


                <h3 className="section-title" style={{color:'#5D4037', marginTop:'30px'}}>DANH MỤC SÁCH</h3>
                
                {loadingBooks ? (
                    <div style={{textAlign:'center'}}>Đang tải dữ liệu...</div>
                ) : (
                    <div style={styles.gridContainer}>
                        {books.map(book => (
                            <div key={book.book_id} style={styles.bookCard}>
                                <div onClick={() => setSelectedBook(book)} style={{cursor:'pointer'}}>
                                    <img 
                                        src={book.image_url || DEFAULT_IMAGE} 
                                        alt={book.name} 
                                        onError={(e) => (e.target as HTMLImageElement).src = DEFAULT_IMAGE}
                                        style={styles.bookImage}
                                    />
                                </div>
                                <div style={styles.bookInfo}>
                                    <div>
                                        <div style={{fontWeight:'bold', marginBottom:'5px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}} title={book.name}>{book.name}</div>
                                        <div style={{fontSize:'12px', color:'#666'}}>{book.author}</div>
                                    </div>
                                    <div style={{marginTop:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span style={{fontSize:'12px', color: book.available_copies > 0 ? 'green' : 'red'}}>
                                            Kho: {book.available_copies}
                                        </span>
                                        <button 
                                            onClick={() => addToCart(book)}
                                            disabled={book.available_copies === 0}
                                            style={{
                                                padding:'5px 10px', 
                                                backgroundColor: book.available_copies > 0 ? '#5D4037' : '#ccc', 
                                                color:'white', border:'none', borderRadius:'4px', cursor: book.available_copies > 0 ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            + Thêm
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL GIỎ HÀNG --- */}
            {showCart && (
                <div style={styles.modalOverlay} onClick={() => setShowCart(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowCart(false)}>&times;</button>
                        <h2 style={{marginTop:0, color:'#5D4037'}}>Giỏ Sách Của Bạn</h2>
                        
                        {cart.length === 0 ? (
                            <p style={{textAlign:'center', color:'#666', padding:'20px'}}>Giỏ hàng đang trống.</p>
                        ) : (
                            <>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Tên sách</th>
                                            <th style={styles.th}>Tác giả</th>
                                            <th style={styles.th}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item, index) => (
                                            <tr key={index}>
                                                <td style={styles.td}>{item.name}</td>
                                                <td style={styles.td}>{item.author}</td>
                                                <td style={styles.td}>
                                                    <button 
                                                        onClick={() => removeFromCart(item.book_id)}
                                                        style={{color:'#d32f2f', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{marginTop:'20px', textAlign:'right'}}>
                                    <button 
                                        onClick={handleCheckout}
                                        style={{padding:'12px 24px', backgroundColor:'#2e7d32', color:'white', border:'none', borderRadius:'6px', fontSize:'16px', cursor:'pointer', fontWeight:'bold'}}
                                    >
                                        Xác Nhận Mượn ({cart.length})
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL LỊCH SỬ --- */}
            {showHistory && (
                <div style={styles.modalOverlay} onClick={() => setShowHistory(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button style={styles.closeBtn} onClick={() => setShowHistory(false)}>&times;</button>
                        <h2 style={{marginTop:0, color:'#5D4037'}}>Lịch Sử Mượn Trả</h2>
                        
                        {history.length === 0 ? (
                            <p style={{textAlign:'center', color:'#666', padding:'20px'}}>Bạn chưa có giao dịch nào.</p>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Sách</th>
                                        <th style={styles.th}>Ngày mượn</th>
                                        <th style={styles.th}>Hạn trả</th>
                                        <th style={styles.th}>Ngày trả</th>
                                        <th style={styles.th}>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((tx) => (
                                        <tr key={tx.borrow_id}>
                                            <td style={styles.td}><b>{tx.book_name}</b></td>
                                            <td style={styles.td}>{new Date(tx.borrow_date).toLocaleDateString()}</td>
                                            <td style={styles.td}>{new Date(tx.due_date).toLocaleDateString()}</td>
                                            <td style={styles.td}>
                                                {tx.return_date ? new Date(tx.return_date).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    padding:'4px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'bold',
                                                    backgroundColor: tx.status === 'RETURNED' ? '#e8f5e9' : (tx.status === 'OVERDUE' ? '#ffebee' : '#e3f2fd'),
                                                    color: tx.status === 'RETURNED' ? '#2e7d32' : (tx.status === 'OVERDUE' ? '#c62828' : '#1565c0')
                                                }}>
                                                    {tx.status === 'RETURNED' ? 'Đã trả' : (tx.status === 'OVERDUE' ? 'Quá hạn' : 'Đang mượn')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL CHI TIẾT SÁCH --- */}
            {selectedBook && (
                <div style={styles.modalOverlay} onClick={() => setSelectedBook(null)}>
                    <div style={{...styles.modalContent, display:'flex', overflow:'hidden', padding:0, maxWidth:'700px'}} onClick={e => e.stopPropagation()}>
                        <button style={{...styles.closeBtn, color:'#999'}} onClick={() => setSelectedBook(null)}>&times;</button>
                        <div style={{width:'40%', backgroundColor:'#f8f9fa', display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <img src={selectedBook.image_url || DEFAULT_IMAGE} style={{maxWidth:'100%', maxHeight:'300px'}} alt="" />
                        </div>
                        <div style={{width:'60%', padding:'30px', display:'flex', flexDirection:'column', justifyContent:'center'}}>
                            <h2 style={{marginTop:0}}>{selectedBook.name}</h2>
                            <p><b>Tác giả:</b> {selectedBook.author}</p>
                            <p><b>Nhà xuất bản:</b> {selectedBook.publisher}</p>
                            <p><b>Năm:</b> {selectedBook.year_published}</p>
                            <p><b>Kho:</b> {selectedBook.available_copies}</p>
                            <button 
                                onClick={() => { addToCart(selectedBook); setSelectedBook(null); }}
                                disabled={selectedBook.available_copies === 0}
                                style={{marginTop:'20px', padding:'10px', backgroundColor:'#007bff', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                            >
                                {selectedBook.available_copies > 0 ? 'Thêm vào giỏ' : 'Hết sách'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
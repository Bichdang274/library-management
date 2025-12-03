import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import BookList from './pages/Books/BookList';
import CategoryList from './pages/Categories/CategoryList';
import Dashboard from './pages/Dashboard'; 

const NavLink = ({ to, label }: { to: string, label: string }) => {
    const location = useLocation();
    // Logic active: Nếu đang ở /books thì highlight, trừ khi ở trang chủ
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    
    return (
        <Link to={to} style={{ 
            textDecoration: 'none', 
            color: isActive ? '#FFECB3' : '#D7CCC8', 
            marginRight: '20px', 
            fontWeight: isActive ? 'bold' : 'normal',
            borderBottom: isActive ? '2px solid #FFECB3' : 'none',
            paddingBottom: '5px',
            fontSize: '15px'
        }}>
            {label}
        </Link>
    );
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* HEADER */}
        <header style={{ 
            backgroundColor: '#5D4037', 
            padding: '15px 30px', 
            color: '#FAF8F1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Logo click về trang chủ */}
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: '24px', fontFamily: 'serif', fontWeight: 'bold', marginRight: '40px', letterSpacing: '1px' }}>
                LIB MANAGEMENT
                </div>
            </Link>
            
            {/* MENU */}
            <nav>
                <NavLink to="/" label="Trang chủ" />
                <NavLink to="/books" label="Quản lý Sách" />
                <NavLink to="/categories" label="Quản lý Thể loại" />
            </nav>
          </div>
          <div style={{ fontSize: '14px', fontStyle: 'italic' }}>Xin chào, Thủ thư</div>
        </header>

        {/* MAIN CONTENT */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '20px', paddingBottom: '50px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />       {/* Trang chủ là Dashboard */}
            <Route path="/books" element={<BookList />} />   {/* Trang sách */}
            <Route path="/categories" element={<CategoryList />} /> {/* Trang thể loại */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
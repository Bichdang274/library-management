import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- SỬA LỖI Ở ĐÂY: Tách dòng import type riêng ---
import { useContext } from 'react';
import type { ReactNode } from 'react'; 
import React from 'react';

// Import Context
import { AuthProvider, AuthContext } from './context/AuthContext';
import type { AuthContextType } from './context/AuthContext';

// Import các trang
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Management from './pages/Management';
import BookList from './pages/Books/BookList';
import CategoryList from './pages/Categories/CategoryList';

// Định nghĩa Interface
interface PrivateRouteProps {
    children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const context = useContext(AuthContext);
    
    // Kiểm tra an toàn
    if (!context) return <div>Auth Context Error</div>;
    
    const { user, loading } = context as AuthContextType;

    if (loading) return <div>Loading...</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Private Routes */}
                    <Route path="/" element={
                        <PrivateRoute><Home /></PrivateRoute>
                    } />
                    
                    <Route path="/management" element={
                        <PrivateRoute><Management /></PrivateRoute>
                    } />

                    <Route path="/books" element={
                        <PrivateRoute><BookList /></PrivateRoute>
                    } />

                    <Route path="/categories" element={
                        <PrivateRoute><CategoryList /></PrivateRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
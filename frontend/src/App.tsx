import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext, AuthContextType } from './context/AuthContext'; // <-- Import AuthContextType
import { useContext, ReactNode } from 'react'; // <-- Import ReactNode
import React from 'react'; // Cần thiết khi dùng JSX trong TypeScript
import Login from './pages/Login';
import Readers from './pages/Readers';
import Home from './pages/Home';
import Management from './pages/Management';
import Register from './pages/Register';

// 1. Định nghĩa Interface cho PrivateRoute Props
interface PrivateRouteProps {
    children: ReactNode; // <-- Khắc phục lỗi 7031
}

// 2. Định kiểu cho component PrivateRoute
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    // 3. Định kiểu cho useContext
    const { user, loading } = useContext(AuthContext) as AuthContextType;
    
    if (loading) return <div>Loading...</div>;
    return user ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Các Route cần bảo vệ */}
                    <Route path="/readers" element={
                        <PrivateRoute>
                            <Readers />
                        </PrivateRoute>
                    } />
                    <Route path="/Home" element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    } />
                    <Route path="/Management" element={
                        <PrivateRoute>
                            <Management />
                        </PrivateRoute>
                    } />
                    
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
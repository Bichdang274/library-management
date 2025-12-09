import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import type { ReactNode } from 'react'; 
import React from 'react';

import { AuthProvider, AuthContext } from './context/AuthContext';
import type { AuthContextType } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Management from './pages/Management';
import BookList from './pages/Books/BookList';
import CategoryList from './pages/Categories/CategoryList';
import Readers from './pages/Readers';
import TransactionPage from './pages/TransactionManager/TransactionPage';
import StatsPage from './pages/StatsPage';

interface PrivateRouteProps {
    children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const context = useContext(AuthContext);
    
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
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/home" element={
                        <PrivateRoute><Home /></PrivateRoute>
                    } />

                    <Route path="/transactionPage" element={
                        <PrivateRoute><TransactionPage/></PrivateRoute>
                    } />

                    <Route path="/statsPage" element={
                        <PrivateRoute><StatsPage /></PrivateRoute>
                    } />
                    
                    <Route path="/readers" element={
                        <PrivateRoute><Readers /></PrivateRoute>
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
import { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    name: string; 
    username?: string; 
    role?: 'reader' | 'manager'| 'admin'; 
}

export interface AuthContextType {
    user: User | null; 
    loading: boolean;
    login: (email: string, password: string) => Promise<User | undefined>;
    logout: () => void;
}

const defaultAuthContextValue: AuthContextType = {
    user: null,
    loading: true,
    login: async () => undefined, 
    logout: () => {}, 
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContextValue);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // FIX 1: Đổi thành /auth/profile để khớp với Backend
            api.get('/auth/profile') 
                .then(res => {
                    // Sửa 2: Backend trả về user luôn, không cần .data.data
                    setUser(res.data as User); 
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string): Promise<User | undefined> => {
        try {
            // FIX 2: Đổi '/login' thành '/auth/login' để khớp với Backend
            const res = await api.post('/auth/login', { email, password });
            
            // Sửa 4: Lấy dữ liệu trực tiếp từ res.data
            const data = res.data; 
            const token = data.token;
            
            // Tạo object user từ response
            const userData: User = {
                id: data.id || data.user?.id, 
                name: data.name || data.user?.name,
                email: data.email || data.user?.email,
                role: data.role || data.user?.role
            };

            if (token) {
                localStorage.setItem('token', token);
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
        return undefined;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
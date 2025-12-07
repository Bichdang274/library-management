import { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

// 1. Định nghĩa lại Interface User cho chuẩn
export interface User {
    id: number | string;
    email: string;
    name: string;
    role: 'admin' | 'reader'; // Chỉ định rõ 2 role này
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    // Hàm login trả về User hoặc undefined (nếu lỗi)
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/profile')
                .then(res => setUser(res.data.user || res.data)) // Handle tùy response backend
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
            const res = await api.post('/auth/login', { email, password });
            
            // Backend trả về: { success: true, token: "...", user: { ... } }
            const { token, user } = res.data;

            if (token && user) {
                localStorage.setItem('token', token);
                setUser(user); // Lưu vào state
                return user;   // Trả về user để Login page sử dụng ngay
            }
        } catch (error) {
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
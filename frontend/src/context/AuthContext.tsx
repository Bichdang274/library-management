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
            // SỬA 1: Bỏ chữ /auth nếu backend không dùng, chỉ để /profile
            api.get('/profile') 
                .then(res => {
                    // SỬA 2: Backend trả về user luôn, không cần .data.data
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
            // SỬA 3: Đổi '/auth/login' thành '/login' để khớp với Backend
            const res = await api.post('/login', { email, password });
            
            // SỬA 4: Lấy dữ liệu trực tiếp từ res.data (không dùng res.data.data)
            const data = res.data; 
            const token = data.token;
            
            // Tạo object user từ response
            const userData: User = {
                id: data.id || data.user?.id, // fallback nếu cấu trúc khác
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
            throw error; // Ném lỗi để file Login.tsx bắt được và hiện thông báo đỏ
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
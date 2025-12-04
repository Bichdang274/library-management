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
            api.get('/auth/profile')
                .then(res => setUser(res.data.data as User)) 
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
            const token = res.data.data.token;
            const userData: User = res.data.data.user;

            if (token && userData) {
                localStorage.setItem('token', token);
                setUser(userData);
                return userData;
            }
        } catch (error) {
            console.error("Login failed:", error);
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
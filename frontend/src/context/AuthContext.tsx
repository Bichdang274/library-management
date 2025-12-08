import { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';


export interface User {
    id: number | string;
    email: string;
    name: string;
    role: 'admin' | 'reader'; 
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api.get('/auth/profile')
                .then(res => setUser(res.data.user || res.data)) 
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
            
            
            const { token, user } = res.data;

            if (token && user) {
                localStorage.setItem('token', token);
                setUser(user); 
                return user;   
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
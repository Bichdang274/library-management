import api from './api';
import type { Category } from '../types';


export const getCategories = async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
};


export const createCategory = async (name: string): Promise<void> => {
    await api.post('/categories', { category_name: name });
};


export const updateCategory = async (id: number, name: string): Promise<void> => {
    await api.put(`/categories/${id}`, { category_name: name });
};


export const deleteCategory = async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
}; 
import api from './api';
import { Category } from '../types/category.types';

export const categoryService = {
  getAllCategories: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data;
  },

  createCategory: async (category: { name: string; color: string }): Promise<Category> => {
    const { data } = await api.post('/categories', category);
    return data;
  },

  updateCategory: async (id: number, category: { name: string; color: string }): Promise<Category> => {
    const { data } = await api.put(`/categories/${id}`, category);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};
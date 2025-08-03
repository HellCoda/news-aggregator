import { useState, useEffect } from 'react';
import { Category } from '../types/category.types';
import { categoryService } from '../services/categoryService';

// Event emitter simple pour synchroniser les instances du hook
const categoryEvents = new EventTarget();

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories...');
      const data = await categoryService.getAllCategories();
      console.log('Categories fetched:', data);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string, color: string) => {
    try {
      console.log('useCategories - Creating category:', { name, color });
      const newCategory = await categoryService.createCategory({ name, color });
      console.log('useCategories - Category created:', newCategory);
      setCategories([...categories, newCategory]);
      
      // Émettre un événement pour notifier les autres instances
      categoryEvents.dispatchEvent(new CustomEvent('categoryCreated', { detail: newCategory }));
      
      return newCategory;
    } catch (err) {
      console.error('useCategories - Error creating category:', err);
      throw new Error('Erreur lors de la création');
    }
  };

  const updateCategory = async (id: number, name: string, color: string) => {
    try {
      console.log('useCategories - Updating category:', { id, name, color });
      const updatedCategory = await categoryService.updateCategory(id, { name, color });
      console.log('useCategories - Category updated:', updatedCategory);
      
      // Mettre à jour localement
      setCategories(categories.map(cat => cat.id === id ? updatedCategory : cat));
      
      // Émettre un événement pour notifier les autres instances
      categoryEvents.dispatchEvent(new CustomEvent('categoryUpdated', { detail: updatedCategory }));
      
      return updatedCategory;
    } catch (err) {
      console.error('useCategories - Error updating category:', err);
      throw new Error('Erreur lors de la modification');
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
      
      // Émettre un événement pour notifier les autres instances
      categoryEvents.dispatchEvent(new CustomEvent('categoryDeleted', { detail: id }));
    } catch (err) {
      throw new Error('Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchCategories();
    
    // Écouter les événements de création/suppression
    const handleCategoryCreated = () => {
      fetchCategories();
    };
    
    const handleCategoryDeleted = () => {
      fetchCategories();
    };
    
    const handleCategoryUpdated = () => {
      fetchCategories();
    };
    
    categoryEvents.addEventListener('categoryCreated', handleCategoryCreated);
    categoryEvents.addEventListener('categoryDeleted', handleCategoryDeleted);
    categoryEvents.addEventListener('categoryUpdated', handleCategoryUpdated);
    
    return () => {
      categoryEvents.removeEventListener('categoryCreated', handleCategoryCreated);
      categoryEvents.removeEventListener('categoryDeleted', handleCategoryDeleted);
      categoryEvents.removeEventListener('categoryUpdated', handleCategoryUpdated);
    };
  }, []);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};
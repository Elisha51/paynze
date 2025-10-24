
import type { Category } from '@/lib/types';

let categories: Category[] = [
    { id: 'cat-1', name: 'Fabrics', description: 'Woven or knit materials.' },
    { id: 'cat-2', name: 'Apparel', description: 'Ready-made clothing items.' },
    { id: 'cat-3', name: 'Footwear', description: 'Shoes, sandals, and boots.' },
    { id: 'cat-4', name: 'Accessories', description: 'Bags, jewelry, and more.' },
];

export async function getCategories(): Promise<Category[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return [...categories];
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const newCategory: Category = { ...category, id: `cat-${Date.now()}` };
  categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(updatedCategory: Category): Promise<Category> {
  await new Promise(resolve => setTimeout(resolve, 300));
  categories = categories.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat);
  return updatedCategory;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  categories = categories.filter(cat => cat.id !== categoryId);
}

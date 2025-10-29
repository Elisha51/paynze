
import type { Category } from '@/lib/types';
import { DataService } from './data-service';

const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Fabrics', description: 'Woven or knit materials.' },
    { id: 'cat-2', name: 'Apparel', description: 'Ready-made clothing items.' },
    { id: 'cat-3', name: 'Footwear', description: 'Shoes, sandals, and boots.' },
    { id: 'cat-4', name: 'Accessories', description: 'Bags, jewelry, and more.' },
];

const categoryService = new DataService<Category>('categories', () => mockCategories);

export async function getCategories(): Promise<Category[]> {
  return await categoryService.getAll();
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const newCategory: Category = { ...category, id: `cat-${Date.now()}` };
  return await categoryService.create(newCategory);
}

export async function updateCategory(updatedCategory: Category): Promise<Category> {
  return await categoryService.update(updatedCategory.id, updatedCategory);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await categoryService.delete(categoryId);
}

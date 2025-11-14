

import type { Category } from '@/lib/types';
import { DataService } from './data-service';

const mockCategories: Category[] = [
    { id: 'cat-main-1', name: 'Apparel', parentId: null },
    { id: 'cat-sub-1a', name: 'T-Shirts', parentId: 'cat-main-1' },
    { id: 'cat-sub-1b', name: 'Dresses', parentId: 'cat-main-1' },
    { id: 'cat-main-2', name: 'Fabrics', parentId: null },
    { id: 'cat-sub-2a', name: 'Kitenge', parentId: 'cat-main-2' },
    { id: 'cat-sub-2b', name: 'Linen', parentId: 'cat-main-2' },
    { id: 'cat-main-3', name: 'Footwear', parentId: null },
    { id: 'cat-main-4', name: 'Accessories', parentId: null },
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

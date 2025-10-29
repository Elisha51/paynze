

import type { Todo } from '@/lib/types';
import { DataService } from './data-service';

const initializeMockTodos: () => Todo[] = () => [
    { id: 'todo-1', title: 'Follow up with Kitenge Kings on PO-002', status: 'To Do', createdAt: new Date().toISOString() },
    { id: 'todo-2', title: 'Prepare end-of-month sales report', status: 'To Do', createdAt: new Date().toISOString() },
    { id: 'todo-3', title: 'Restock shelves in Downtown Store', status: 'Completed', createdAt: new Date().toISOString() },
];

const todoService = new DataService<Todo>('todos', initializeMockTodos);

export async function getTodos(): Promise<Todo[]> {
  const todos = await todoService.getAll();
  return [...todos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
  const newTodo: Todo = { ...todo, id: `todo-${Date.now()}` };
  return await todoService.create(newTodo, { prepend: true });
}

export async function updateTodo(todoId: string, updates: Partial<Todo>): Promise<Todo> {
  return await todoService.update(todoId, updates);
}

export async function deleteTodo(todoId: string): Promise<void> {
  await todoService.delete(todoId);
}

    
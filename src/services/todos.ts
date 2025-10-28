
import type { Todo } from '@/lib/types';

let todos: Todo[] = [
    { id: 'todo-1', title: 'Follow up with Kitenge Kings on PO-002', status: 'To Do', createdAt: new Date().toISOString() },
    { id: 'todo-2', title: 'Prepare end-of-month sales report', status: 'To Do', createdAt: new Date().toISOString() },
    { id: 'todo-3', title: 'Restock shelves in Downtown Store', status: 'Completed', createdAt: new Date().toISOString() },
];

export async function getTodos(): Promise<Todo[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [...todos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addTodo(todo: Omit<Todo, 'id'>): Promise<Todo> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const newTodo: Todo = { ...todo, id: `todo-${Date.now()}` };
  todos.unshift(newTodo);
  return newTodo;
}

export async function updateTodo(todoId: string, updates: Partial<Todo>): Promise<Todo> {
  await new Promise(resolve => setTimeout(resolve, 100));
  let updatedTodo: Todo | undefined;
  todos = todos.map(todo => {
    if (todo.id === todoId) {
      updatedTodo = { ...todo, ...updates };
      return updatedTodo;
    }
    return todo;
  });
  if (!updatedTodo) {
    throw new Error('Todo not found');
  }
  return updatedTodo;
}

export async function deleteTodo(todoId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 100));
  todos = todos.filter(todo => todo.id !== todoId);
}

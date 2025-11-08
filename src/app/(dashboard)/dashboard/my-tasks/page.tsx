
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Truck, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getTodos, addTodo, updateTodo, deleteTodo } from '@/services/todos';
import { getStaffOrders } from '@/services/staff';
import type { Order, Todo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EmptyState } from '@/components/ui/empty-state';

export default function MyTasksPage() {
    const { user } = useAuth();
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTasks() {
            if (!user) return;
            setIsLoading(true);
            const [orders, userTodos] = await Promise.all([
                getStaffOrders(user.id),
                getTodos()
            ]);
            setAssignedOrders(orders.filter(o => !['Delivered', 'Picked Up', 'Cancelled'].includes(o.status)));
            setTodos(userTodos);
            setIsLoading(false);
        }
        loadTasks();
    }, [user]);

    const handleAddTodo = async () => {
        if (!newTodo.trim()) return;
        const added = await addTodo({ title: newTodo, status: 'To Do', createdAt: new Date().toISOString() });
        setTodos(prev => [added, ...prev]);
        setNewTodo('');
    };

    const handleToggleTodo = async (id: string, currentStatus: 'To Do' | 'Completed') => {
        const newStatus = currentStatus === 'To Do' ? 'Completed' : 'To Do';
        const updated = await updateTodo(id, { status: newStatus });
        setTodos(prev => prev.map(t => t.id === id ? updated : t));
    };

    const handleDeleteTodo = async (id: string) => {
        await deleteTodo(id);
        setTodos(prev => prev.filter(t => t.id !== id));
    }
    
    if (isLoading) {
        return <div>Loading tasks...</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            
            {assignedOrders.length === 0 && todos.length === 0 && (
                <EmptyState
                    icon={<ClipboardList className="h-12 w-12 text-primary" />}
                    title="No tasks here!"
                    description="You have no assigned deliveries or personal to-do items."
                />
            )}

            {assignedOrders.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Assigned Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                        {assignedOrders.map(order => (
                            <li key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">Deliver Order #{order.id}</p>
                                        <p className="text-sm text-muted-foreground">To: {order.customerName}</p>
                                    </div>
                                    <Badge variant={order.status === 'Shipped' ? 'default' : 'secondary'}>{order.status}</Badge>
                                </div>
                                <Button asChild size="sm" variant="outline">
                                    <Link href={`/dashboard/orders/${order.id}`}>View Order</Link>
                                </Button>
                            </li>
                        ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Personal To-Do List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input 
                            value={newTodo} 
                            onChange={(e) => setNewTodo(e.target.value)}
                            placeholder="Add a new task..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                        />
                        <Button onClick={handleAddTodo}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add
                        </Button>
                    </div>
                    {todos.length > 0 ? (
                        <ul className="space-y-2">
                            {todos.map(todo => (
                                <li key={todo.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Checkbox
                                                id={`todo-${todo.id}`}
                                                checked={todo.status === 'Completed'}
                                            />
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    {todo.status === 'Completed' ? 'Mark as To-Do?' : 'Mark as Completed?'}
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will change the status of your to-do item.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleToggleTodo(todo.id, todo.status)}>
                                                    Confirm
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Label 
                                        htmlFor={`todo-${todo.id}`}
                                        className={cn(
                                            "flex-1 cursor-pointer",
                                            todo.status === 'Completed' && 'line-through text-muted-foreground'
                                        )}
                                    >
                                        {todo.title}
                                    </Label>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(todo.createdAt), { addSuffix: true })}
                                    </span>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure you want to delete this task?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the task "{todo.title}".
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteTodo(todo.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">You have no personal to-do items.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
    
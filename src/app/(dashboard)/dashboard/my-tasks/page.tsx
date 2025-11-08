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
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { UpdateDeliveryStatusDialog } from './_components/update-delivery-status-dialog';

export default function MyTasksPage() {
    const { user } = useAuth();
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const loadTasks = async () => {
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

    useEffect(() => {
        loadTasks();
    }, [user]);

    const handleAddTodo = async (newTodo: string) => {
        if (!newTodo.trim()) return;
        const added = await addTodo({ title: newTodo, status: 'To Do', createdAt: new Date().toISOString() });
        setTodos(prev => [added, ...prev]);
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
        return <DashboardPageLayout title="My Tasks"><div>Loading tasks...</div></DashboardPageLayout>
    }

    return (
        <DashboardPageLayout title="My Tasks" description="A list of your assigned deliveries and personal to-do items.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assignedOrders.length > 0 ? (
                            <ul className="space-y-3">
                                {assignedOrders.map(order => (
                                    <li key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Truck className="h-5 w-5 text-primary" />
                                            <div>
                                                <Link href={`/dashboard/orders/${order.id}`} className="font-medium hover:underline">Deliver Order #{order.id}</Link>
                                                <p className="text-sm text-muted-foreground">To: {order.customerName}</p>
                                            </div>
                                            <Badge variant={order.status === 'Shipped' ? 'default' : 'secondary'}>{order.status}</Badge>
                                        </div>
                                         <UpdateDeliveryStatusDialog order={order} onUpdate={loadTasks} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <EmptyState
                                icon={<Truck className="h-12 w-12 text-muted-foreground" />}
                                title="No Deliveries"
                                description="You have no assigned deliveries at the moment."
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal To-Do List</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <TodoInput onAdd={handleAddTodo} />
                        {todos.length > 0 ? (
                            <ul className="space-y-2 mt-4">
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
                            <EmptyState
                                icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />}
                                title="All Clear!"
                                description="You have no personal to-do items."
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardPageLayout>
    );
}

function TodoInput({ onAdd }: { onAdd: (title: string) => void }) {
    const [newTodo, setNewTodo] = useState('');
    const handleAdd = () => {
        onAdd(newTodo);
        setNewTodo('');
    }
    return (
        <div className="flex gap-2">
            <Input 
                value={newTodo} 
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
            </Button>
        </div>
    )
}

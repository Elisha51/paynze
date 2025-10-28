
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Staff, Order, Todo } from '@/lib/types';
import { getStaff, getStaffOrders } from '@/services/staff';
import { getTodos, addTodo, updateTodo } from '@/services/todos';
import { updateOrder } from '@/services/orders';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ClipboardList, PlusCircle, CheckCircle, Truck, Store } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const LOGGED_IN_STAFF_ID = 'staff-003';

type UnifiedTask = {
  id: string;
  type: 'Order' | 'Todo';
  title: string;
  date: string;
  isCompleted: boolean;
  original: Order | Todo;
};

export default function MyTasksPage() {
    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
        setLoading(true);
        const [staffList, orderData, todoData] = await Promise.all([
            getStaff(),
            getStaffOrders(LOGGED_IN_STAFF_ID),
            getTodos(),
        ]);
        const member = staffList.find(s => s.id === LOGGED_IN_STAFF_ID);
        
        setStaffMember(member || null);
        setAssignedOrders(orderData);
        setTodos(todoData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const unifiedTasks = useMemo(() => {
        const orderTasks: UnifiedTask[] = assignedOrders.map(order => ({
            id: `order-${order.id}`,
            type: 'Order',
            title: `Fulfill Order #${order.id} for ${order.customerName}`,
            date: order.date,
            isCompleted: ['Delivered', 'Picked Up', 'Cancelled'].includes(order.status),
            original: order,
        }));
        
        const personalTasks: UnifiedTask[] = todos.map(todo => ({
            id: `todo-${todo.id}`,
            type: 'Todo',
            title: todo.title,
            date: todo.createdAt,
            isCompleted: todo.status === 'Completed',
            original: todo,
        }));

        return [...orderTasks, ...personalTasks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [assignedOrders, todos]);

    const handleToggleTask = async (task: UnifiedTask) => {
        if (task.type === 'Todo') {
            const originalTodo = task.original as Todo;
            const newStatus = originalTodo.status === 'To Do' ? 'Completed' : 'To Do';
            const updated = await updateTodo(originalTodo.id, { status: newStatus });
            setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
        } else { // Order
            const originalOrder = task.original as Order;
            const newStatus = ['Delivered', 'Picked Up'].includes(originalOrder.status) 
                ? 'Shipped' // Revert to previous state for demo, a real app would be more complex
                : originalOrder.fulfillmentMethod === 'Delivery' ? 'Delivered' : 'Picked Up';
            
            const updated = await updateOrder(originalOrder.id, { status: newStatus });
            setAssignedOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        }
    };
    
    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) {
            toast({ variant: 'destructive', title: 'Task title cannot be empty.' });
            return;
        }
        const newTodo = await addTodo({ title: newTaskTitle, status: 'To Do', createdAt: new Date().toISOString() });
        setTodos(prev => [newTodo, ...prev]);
        setNewTaskTitle('');
        setIsAddDialogOpen(false);
        toast({ title: 'Task Added' });
    }

    if (loading || !staffMember) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-6 w-96" />
                <Card><CardContent className="p-4"><Skeleton className="h-48" /></CardContent></Card>
            </div>
        );
    }
    
    const { todoTasks, completedTasks } = {
        todoTasks: unifiedTasks.filter(t => !t.isCompleted),
        completedTasks: unifiedTasks.filter(t => t.isCompleted),
    };


    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                    <p className="text-muted-foreground">Your assigned orders and personal to-do items.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                         <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a new task</DialogTitle>
                            <DialogDescription>Create a personal to-do item.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-2">
                            <Label htmlFor="task-title">Task Title</Label>
                            <Input 
                                id="task-title" 
                                value={newTaskTitle} 
                                onChange={(e) => setNewTaskTitle(e.target.value)} 
                                placeholder="e.g., Follow up with supplier"
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                            <Button onClick={handleAddTask}>Save Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <ClipboardList className="h-5 w-5" /> To Do ({todoTasks.length})
                        </CardTitle>
                        <CardDescription>Active assignments and tasks that require your action.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todoTasks.length > 0 ? todoTasks.map(task => (
                                <div key={task.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                                    <Checkbox id={task.id} checked={task.isCompleted} onCheckedChange={() => handleToggleTask(task)} className="mt-1" />
                                    <div className="flex-1">
                                        <label htmlFor={task.id} className="font-medium cursor-pointer">{task.title}</label>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            {task.type === 'Order' ? (
                                                (task.original as Order).fulfillmentMethod === 'Delivery' ? <Truck className="h-3 w-3"/> : <Store className="h-3 w-3"/>
                                            ) : <div className="w-3 h-3"/>}
                                            <span>{format(new Date(task.date), 'PPP')}</span>
                                            {task.type === 'Order' && <span>|</span>}
                                            {task.type === 'Order' && <Link href={`/dashboard/orders/${(task.original as Order).id}`} className="hover:underline text-primary">View Order</Link>}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No active tasks.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" /> Completed ({completedTasks.length})
                        </CardTitle>
                        <CardDescription>A history of your fulfilled orders and completed tasks.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {completedTasks.length > 0 ? completedTasks.map(task => (
                                <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border">
                                    <Checkbox id={task.id} checked={task.isCompleted} onCheckedChange={() => handleToggleTask(task)} className="mt-1"/>
                                    <div className="flex-1">
                                        <label htmlFor={task.id} className="font-medium text-muted-foreground line-through cursor-pointer">{task.title}</label>
                                         <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            {task.type === 'Order' ? (
                                                (task.original as Order).fulfillmentMethod === 'Delivery' ? <Truck className="h-3 w-3"/> : <Store className="h-3 w-3"/>
                                            ) : <div className="w-3 h-3"/>}
                                            <span>{format(new Date(task.date), 'PPP')}</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No completed tasks yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
           </div>
        </div>
    );
}

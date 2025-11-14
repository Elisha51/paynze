
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateOrder } from '@/services/orders';
import { useAuth } from '@/context/auth-context';
import type { Order } from '@/lib/types';


export function FulfillOrderDialog({ order, action, onUpdate, children }: { order: Order, action: 'deliver' | 'pickup' | 'ship' | 'ready', onUpdate: (updatedOrder: Order) => void, children: React.ReactNode }) {
    const { user } = useAuth();
    const { toast } = useToast();

    const titles = {
        deliver: 'Mark as Delivered',
        pickup: 'Mark as Picked Up',
        ship: 'Mark as Shipped',
        ready: 'Mark as Ready for Pickup'
    };

    const descriptions = {
        deliver: `This will mark order #${order.id} as 'Delivered' and update inventory. This action cannot be undone.`,
        pickup: `This will mark order #${order.id} as 'Picked Up' and update inventory. This action cannot be undone.`,
        ship: `This will mark order #${order.id} as 'Shipped'. Inventory will not be adjusted until the order is delivered.`,
        ready: `This will mark order #${order.id} as 'Ready for Pickup'.`
    };
    
    const newStatusMap = {
        deliver: 'Delivered',
        pickup: 'Picked Up',
        ship: 'Shipped',
        ready: 'Ready for Pickup',
    } as const;

    const handleFulfill = async () => {
        if (!user) return;
        const newStatus = newStatusMap[action];
        const updates: Partial<Order> = { status: newStatus };

        if (action === 'deliver' || action === 'pickup') {
            updates.fulfilledByStaffId = user.id;
            updates.fulfilledByStaffName = user.name;
        }
        
        const updatedOrder = await updateOrder(order.id, updates);

        onUpdate(updatedOrder);
        toast({ title: `Order #${order.id} Updated`, description: `Status changed to ${newStatus}.`});
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titles[action]}</DialogTitle>
                    <DialogDescription>{descriptions[action]}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild><Button onClick={handleFulfill}>Confirm</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

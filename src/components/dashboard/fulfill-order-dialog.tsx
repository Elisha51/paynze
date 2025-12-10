
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


export function FulfillOrderDialog({ order, action, onUpdate, children }: { order: Order, action: 'paid' | 'deliver' | 'pickup' | 'ready', onUpdate: (updatedOrder: Order) => void, children: React.ReactNode }) {
    const { user } = useAuth();
    const { toast } = useToast();

    const isDelivery = order.fulfillmentMethod === 'Delivery';

    const titles: Record<typeof action, string> = {
        paid: 'Mark as Paid',
        deliver: 'Mark as Delivered',
        pickup: 'Mark as Picked Up',
        ready: isDelivery ? 'Prepare for Delivery' : 'Ready for Pickup',
    };
    

    const descriptions: Record<typeof action, string> = {
        paid: `This will mark order #${order.id} as 'Paid'.`,
        deliver: `This will mark order #${order.id} as 'Delivered' and update inventory. This action cannot be undone.`,
        pickup: `This will mark order #${order.id} as 'Picked Up' and update inventory. This action cannot be undone.`,
        ready: isDelivery 
            ? `This will mark order #${order.id} as 'Ready for Delivery'. It will then appear in the Deliveries tab for assignment.`
            : `This will mark order #${order.id} as 'Ready for Pickup'. The customer will be notified.`
    };
    
    const newStatusMap: Record<typeof action, Order['status'] | null> = {
        paid: 'Paid',
        deliver: 'Delivered',
        pickup: 'Picked Up',
        ready: 'Ready for Delivery',
    };

    const handleFulfill = async () => {
        if (!user) return;
        
        const updates: Partial<Order> = {};
        const newStatus = newStatusMap[action];

        if (newStatus) {
            updates.status = newStatus;
        }

        if (action === 'paid') {
            updates.payment = { ...order.payment, status: 'completed' };
        }

        if (action === 'deliver' || action === 'pickup') {
            updates.fulfilledByStaffId = user.id;
            updates.fulfilledByStaffName = user.name;
        }
        
        try {
            const updatedOrder = await updateOrder(order.id, updates);
            onUpdate(updatedOrder);
            toast({ title: `Order #${order.id} Updated`, description: `Status changed to ${updates.status || 'updated'}.`});
        } catch (e) {
            toast({ variant: 'destructive', title: "Update Failed", description: "There was an error updating the order." });
        }
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

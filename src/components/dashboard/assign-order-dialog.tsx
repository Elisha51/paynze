
'use client';
import * as React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateOrder } from '@/services/orders';
import type { Order, Staff } from '@/lib/types';


export function AssignOrderDialog({ order, staff, onUpdate, children }: { order: Order, staff: Staff[], onUpdate: (updatedOrder: Order) => void, children: React.ReactNode }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedStaffId, setSelectedStaffId] = React.useState<string | null>(null);

    const deliveryRiders = staff.filter(s => s.role === 'Agent');

    const suggestedRiders = React.useMemo(() => {
        return deliveryRiders
            .filter(rider => {
                const isOnline = rider.onlineStatus === 'Online';
                if (!rider.attributes) return isOnline;
                const deliveryZones = rider.attributes.deliveryZones as string[] | undefined;
                if (!deliveryZones || deliveryZones.length === 0) return isOnline;
                return isOnline && deliveryZones.includes(order.shippingAddress.city);
            })
            .sort((a,b) => (a.assignedOrders?.length || 0) - (b.assignedOrders?.length || 0));
    }, [deliveryRiders, order.shippingAddress.city]);
    
    const otherRiders = deliveryRiders.filter(r => !suggestedRiders.find(s => s.id === r.id));

    const handleAssign = async () => {
        if (!selectedStaffId) {
            toast({ variant: 'destructive', title: 'Please select a staff member.' });
            return;
        }
        const selectedStaffMember = staff.find(s => s.id === selectedStaffId);
        if (!selectedStaffMember) return;
        
        const updatedOrder = await updateOrder(order.id, { 
            assignedStaffId: selectedStaffId, 
            assignedStaffName: selectedStaffMember.name,
            status: 'Shipped',
        });

        onUpdate(updatedOrder);
        toast({ title: 'Order Assigned', description: `Order ${order.id} has been assigned to ${selectedStaffMember.name}.` });
        setIsOpen(false);
    }

    return (
         <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Order #{order.id}</DialogTitle>
                    <DialogDescription>Select a staff member to assign this order to for delivery.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedStaffId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a staff member..." />
                        </SelectTrigger>
                        <SelectContent>
                             {suggestedRiders.length > 0 && <SelectValue>Suggested Riders</SelectValue>}
                             {suggestedRiders.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.assignedOrders?.length || 0} orders)</SelectItem>
                            ))}
                            {otherRiders.length > 0 && <SelectValue>Other Riders</SelectValue>}
                            {otherRiders.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name} ({s.assignedOrders?.length || 0} orders)</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAssign}>Assign Order</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

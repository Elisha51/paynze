'use client';
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { updateOrder } from '@/services/orders';
import type { Order, DeliveryNote } from '@/lib/types';
import { RotateCcw } from 'lucide-react';

export function RevertStatusDialog({ order, onUpdate }: { order: Order; onUpdate: (updatedOrder: Order) => void }) {
    const [reason, setReason] = useState('');
    const { user } = useAuth();
    const { toast } = useToast();

    const getPreviousStatus = (): Order['status'] => {
        if (order.status === 'Delivered') return 'Shipped';
        if (order.status === 'Picked Up') return 'Ready for Pickup';
        if (order.status === 'Shipped') return 'Paid';
        if (order.status === 'Ready for Pickup') return 'Paid';
        return order.status; // Fallback
    };

    const handleRevert = async () => {
        if (!user) return;
        if (!reason.trim()) {
            toast({ variant: 'destructive', title: 'A reason is required to revert status.'});
            return;
        }

        const previousStatus = getPreviousStatus();
        const newNote: DeliveryNote = {
            id: `note-revert-${Date.now()}`,
            staffId: user.id,
            staffName: user.name,
            note: `Status reverted from "${order.status}" to "${previousStatus}". Reason: ${reason}`,
            date: new Date().toISOString(),
        };

        const updatedOrder = await updateOrder(order.id, {
            status: previousStatus,
            deliveryNotes: [...(order.deliveryNotes || []), newNote]
        });
        
        toast({ title: 'Status Reverted', description: `Order status has been changed back to "${previousStatus}".`});
        onUpdate(updatedOrder);
        setReason('');
    };

    return (
        <Dialog onOpenChange={(open) => !open && setReason('')}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-orange-600 focus:text-orange-600">
                    <RotateCcw className="mr-2 h-4 w-4" /> Revert Status
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Revert Order Status</DialogTitle>
                    <DialogDescription>
                        This will revert the order from "{order.status}" to "{getPreviousStatus()}". This action will be logged.
                    </DialogDescription>
                </DialogHeader>
                 <div className="py-4 space-y-2">
                    <Label htmlFor="revert-reason">Reason for Reversal</Label>
                    <Textarea id="revert-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Marked as delivered by mistake." />
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <DialogClose asChild>
                        <Button onClick={handleRevert} disabled={!reason.trim()}>Confirm Revert</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

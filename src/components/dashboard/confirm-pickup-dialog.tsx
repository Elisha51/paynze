
'use client';
import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Order, PickupDetails } from '@/lib/types';
import { updateOrder } from '@/services/orders';
import { useAuth } from '@/context/auth-context';

type ConfirmPickupDialogProps = {
  order: Order;
  onUpdate: (updatedOrder: Order) => void;
  children: React.ReactNode;
};

export function ConfirmPickupDialog({ order, onUpdate, children }: ConfirmPickupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [collectorName, setCollectorName] = useState('');
  const [collectorPhone, setCollectorPhone] = useState('');
  const [collectorId, setCollectorId] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConfirm = async () => {
    if (!user) return;
    if (!collectorName || !collectorPhone) {
        toast({ variant: 'destructive', title: 'Collector name and phone are required.' });
        return;
    }

    const pickupDetails: PickupDetails = {
        name: collectorName,
        phone: collectorPhone,
        idNumber: collectorId,
        date: new Date().toISOString(),
    };

    const updates: Partial<Order> = {
        status: 'Picked Up',
        fulfilledByStaffId: user.id,
        fulfilledByStaffName: user.name,
        pickupDetails: pickupDetails,
    };

    try {
      const updatedOrder = await updateOrder(order.id, updates);
      onUpdate(updatedOrder);
      toast({
        title: 'Order Marked as Picked Up',
        description: `Details for collector ${collectorName} have been saved.`,
      });
      setIsOpen(false);
      // Reset form
      setCollectorName('');
      setCollectorPhone('');
      setCollectorId('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Pickup for Order #{order.id}</DialogTitle>
          <DialogDescription>
            Enter the details of the person collecting the order. This action will mark the order as completed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="collectorName">Collector's Full Name</Label>
            <Input id="collectorName" value={collectorName} onChange={(e) => setCollectorName(e.target.value)} placeholder="e.g., John Doe" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="collectorPhone">Collector's Phone Number</Label>
            <Input id="collectorPhone" type="tel" value={collectorPhone} onChange={(e) => setCollectorPhone(e.target.value)} placeholder="e.g., 0772123456" />
          </div>
           <div className="space-y-2">
            <Label htmlFor="collectorId">Collector's ID Number (Optional)</Label>
            <Input id="collectorId" value={collectorId} onChange={(e) => setCollectorId(e.target.value)} placeholder="e.g., National ID, Driver's License" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Pickup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

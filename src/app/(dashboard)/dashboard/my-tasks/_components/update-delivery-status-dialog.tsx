
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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/types';
import { updateOrder } from '@/services/orders';
import { FileUploader } from '@/components/ui/file-uploader';
import { PenSquare } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

type UpdateDeliveryStatusDialogProps = {
  order: Order;
  onUpdate: () => void;
};

const deliveryStatuses: Order['status'][] = ['Shipped', 'Attempted Delivery', 'Delivered'];

export function UpdateDeliveryStatusDialog({ order, onUpdate }: UpdateDeliveryStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Order['status']>(order.status);
  const [notes, setNotes] = useState('');
  const [proof, setProof] = useState<File[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleUpdate = async () => {
    if (!user) return;

    const updates: Partial<Order> = { status };
    if (notes.trim()) {
      const newNote = {
        id: `note-${Date.now()}`,
        staffId: user.id,
        staffName: user.name,
        note: notes.trim(),
        date: new Date().toISOString(),
      };
      updates.deliveryNotes = [...(order.deliveryNotes || []), newNote];
    }
    
    if (proof.length > 0) {
        // In a real app, this would upload the file and get a URL
        updates.proofOfDeliveryUrl = URL.createObjectURL(proof[0]);
    }

    try {
      await updateOrder(order.id, updates);
      toast({ title: 'Delivery Status Updated', description: `Order #${order.id} has been updated to "${status}".` });
      onUpdate(); // Re-fetch tasks
      setIsOpen(false);
      // Reset form state after closing
      setNotes('');
      setProof([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><PenSquare className="mr-2 h-4 w-4" /> Update</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status for Order #{order.id}</DialogTitle>
          <DialogDescription>
            Change the delivery status, add notes, or upload proof of delivery.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Order['status'])}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                {deliveryStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Delivery Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Customer not available, left with security."
            />
          </div>
          <div className="space-y-2">
            <Label>Proof of Delivery (Optional)</Label>
            <FileUploader
                files={proof}
                onFilesChange={setProof}
                maxFiles={1}
                accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
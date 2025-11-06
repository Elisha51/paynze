

'use client';
import * as React from 'react';
import { PlusCircle, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/types';
import { DataTable } from './data-table';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getCustomerColumns } from './customers-columns';
import { useAuth } from '@/context/auth-context';

type MessageType = 'WhatsApp' | 'SMS' | null;

export function CustomersTable({ columns: initialColumns, data, isLoading }: { columns: any[], data: Customer[], isLoading: boolean }) {
    const [messageTarget, setMessageTarget] = React.useState<{customer: Customer, type: MessageType} | null>(null);
    const [messageContent, setMessageContent] = React.useState('');
    const [customers, setCustomers] = React.useState(data);
    const { toast } = useToast();
    const { user } = useAuth();
    
    React.useEffect(() => {
        setCustomers(data);
    }, [data]);
    
    const canEdit = user?.permissions.customers.edit ?? false;
    const canDelete = user?.permissions.customers.delete ?? false;

    const handleDeleteCustomer = (customerId: string) => {
        // In a real app, call a service to delete the customer
        console.log("Deleting customer:", customerId);
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        toast({ title: "Customer Deleted", variant: "destructive" });
    };

    const columns = React.useMemo(() => getCustomerColumns(handleDeleteCustomer, canEdit, canDelete), [canEdit, canDelete]);
    
    const handleSendMessage = () => {
        if (!messageTarget) return;
        if (!messageContent.trim()) {
            toast({ variant: 'destructive', title: 'Message cannot be empty.' });
            return;
        }
        
        console.log(`Sending ${messageTarget.type} to ${messageTarget.customer.name}: ${messageContent}`);
        
        toast({ title: 'Message Sent', description: `Your ${messageTarget.type} has been sent to ${messageTarget.customer.name}.` });
        setMessageTarget(null);
        setMessageContent('');
    };

    const customerGroups = [
        { value: 'default', label: 'Default' },
        { value: 'Wholesaler', label: 'Wholesaler' },
        { value: 'Retailer', label: 'Retailer' },
    ];


  return (
    <>
    <DataTable
      columns={columns}
      data={customers}
      isLoading={isLoading}
      filters={[{
        columnId: 'customerGroup',
        title: 'Group',
        options: customerGroups
      }]}
      emptyState={{
        icon: Users,
        title: "No Customers Yet",
        description: "You haven't added any customers. Add your first customer to get started.",
        cta: (
            <Button asChild>
                <Link href="/dashboard/customers/add">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Link>
            </Button>
        )
      }}
    />
    <Dialog open={!!messageTarget} onOpenChange={(open) => !open && setMessageTarget(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send {messageTarget?.type} to {messageTarget?.customer.name}</DialogTitle>
                <DialogDescription>
                    Compose your message below. This will be sent via our simulated messaging service and logged in the customer's activity feed.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Textarea 
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-[120px]"
                />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSendMessage}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

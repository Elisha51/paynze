
'use client';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { PlusCircle, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/types';
import { DataTable } from './data-table';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type MessageType = 'WhatsApp' | 'SMS' | null;

type CustomersTableProps = {
  columns: ColumnDef<any, any>[];
  data: any[];
  isLoading: boolean;
};

export function CustomersTable({ columns, data, isLoading }: CustomersTableProps) {
    const [messageTarget, setMessageTarget] = React.useState<{customer: Customer, type: MessageType} | null>(null);
    const [messageContent, setMessageContent] = React.useState('');
    const { toast } = useToast();
    
    const handleSendMessage = () => {
        if (!messageTarget) return;
        if (!messageContent.trim()) {
            toast({ variant: 'destructive', title: 'Message cannot be empty.' });
            return;
        }
        
        console.log(`Sending ${messageTarget.type} to ${messageTarget.customer.name}: ${messageContent}`);
        
        // This is a simulation. In a real app, you would save this to the backend.
        // For now, we'll just show a toast. A refresh would show the new activity on the detail page.
        
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
      data={data}
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

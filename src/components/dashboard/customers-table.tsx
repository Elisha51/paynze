'use client';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, MessageCircle, Phone, Info, ArrowUpDown, PlusCircle, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Customer, OnboardingFormData } from '@/lib/types';
import { DataTable } from './data-table';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

type MessageType = 'WhatsApp' | 'SMS' | null;

const getColumns = (
    currency: string, 
    onSendMessage: (customer: Customer, type: MessageType) => void,
    canEdit: boolean,
): ColumnDef<Customer>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    cell: ({ row }) => {
        const customer = row.original;
        return (
             <Link href={`/dashboard/customers/${customer.id}`} className="font-medium hover:underline">
                {customer.name}
            </Link>
        )
    }
  },
  {
    accessorKey: 'email',
    header: 'Contact',
    cell: ({ row }) => {
        const customer = row.original;
        return (
            <div className="flex flex-col">
                <span>{customer.email}</span>
                <span className="text-muted-foreground">{customer.phone}</span>
            </div>
        )
    }
  },
  {
    accessorKey: 'customerGroup',
    header: 'Group',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('customerGroup')}</Badge>,
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'lastOrderDate',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    accessorKey: 'totalSpend',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Total Spend
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
    cell: ({ row }) => {
      const customer = row.original;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(customer.totalSpend);
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <div className="text-right sticky right-0">Actions</div>,
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="bg-background text-right sticky right-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
                <Link href={`/dashboard/customers/${customer.id}`}>
                    <Info className="mr-2 h-4 w-4" />
                    View Details
                </Link>
            </DropdownMenuItem>
            {canEdit && (
              <>
                <DropdownMenuItem onSelect={() => onSendMessage(customer, 'WhatsApp')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send via WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onSendMessage(customer, 'SMS')}>
                    <Phone className="mr-2 h-4 w-4" />
                    Send via SMS
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];

type CustomersTableProps = {
  customers: Customer[];
  isLoading: boolean;
};

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
    const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);
    const [messageTarget, setMessageTarget] = React.useState<{customer: Customer, type: MessageType} | null>(null);
    const [messageContent, setMessageContent] = React.useState('');
    const { toast } = useToast();
    const { user } = useAuth();
    const canEdit = user?.permissions.customers.edit;

    React.useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);
    
    const handleOpenMessageDialog = (customer: Customer, type: MessageType) => {
        setMessageTarget({ customer, type });
    };

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

    const columns = React.useMemo(() => getColumns(settings?.currency || 'UGX', handleOpenMessageDialog, !!canEdit), [settings?.currency, canEdit]);
    
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

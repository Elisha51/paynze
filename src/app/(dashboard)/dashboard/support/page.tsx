
'use client';
import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Send, LifeBuoy, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';

type SupportTicket = {
    id: string;
    subject: string;
    category: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    lastUpdated: string;
};

const mockTickets: SupportTicket[] = [
    { id: 'TKT-001', subject: 'Problem with payout account', category: 'Billing', status: 'In Progress', lastUpdated: new Date().toISOString() },
    { id: 'TKT-002', subject: 'How to set up custom domain?', category: 'Technical', status: 'Resolved', lastUpdated: '2024-07-25T10:00:00Z' },
];

const getColumns = (): ColumnDef<SupportTicket>[] => [
    {
        id: 'select',
        header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: 'id',
        header: 'Ticket ID',
    },
    {
        accessorKey: 'subject',
        header: 'Subject',
    },
    {
        accessorKey: 'category',
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Category<ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.original.status === 'Resolved' ? 'default' : 'secondary'}>{row.original.status}</Badge>
    },
    {
        accessorKey: 'lastUpdated',
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Last Updated<ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
        cell: ({ row }) => format(new Date(row.original.lastUpdated), 'PPP')
    }
];

export default function SupportPage() {
    const { toast } = useToast();
    const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
    const [newTicket, setNewTicket] = useState({ subject: '', category: '', description: '' });

    const handleSubmitTicket = () => {
        if (!newTicket.subject || !newTicket.category || !newTicket.description) {
            toast({ variant: 'destructive', title: 'Please fill all fields.' });
            return;
        }

        const newTicketData: SupportTicket = {
            id: `TKT-${String(Date.now()).slice(-4)}`,
            subject: newTicket.subject,
            category: newTicket.category,
            status: 'Open',
            lastUpdated: new Date().toISOString(),
        };
        
        setTickets(prev => [newTicketData, ...prev]);
        setNewTicket({ subject: '', category: '', description: '' });

        toast({
            title: 'Ticket Submitted',
            description: `Your support ticket #${newTicketData.id} has been received.`,
        });
    };

    const columns = getColumns();

    return (
        <DashboardPageLayout title="Support Center" description="Get help and report issues.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Support Tickets</CardTitle>
                            <CardDescription>A history of your communication with our support team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={columns} data={tickets} isLoading={false} />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><LifeBuoy className="h-5 w-5"/> Create a New Ticket</CardTitle>
                            <CardDescription>Our team will get back to you as soon as possible.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" value={newTicket.subject} onChange={(e) => setNewTicket(p => ({...p, subject: e.target.value}))}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={newTicket.category} onValueChange={(v) => setNewTicket(p => ({...p, category: v}))}>
                                    <SelectTrigger id="category"><SelectValue placeholder="Select a category..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Billing">Billing & Payments</SelectItem>
                                        <SelectItem value="Technical">Technical Issue</SelectItem>
                                        <SelectItem value="Design">Design & Customization</SelectItem>
                                        <SelectItem value="Integration">Integration Request</SelectItem>
                                        <SelectItem value="General">General Inquiry</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="description">Describe the issue</Label>
                                <Textarea id="description" value={newTicket.description} onChange={(e) => setNewTicket(p => ({...p, description: e.target.value}))} placeholder="Please provide as much detail as possible..."/>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSubmitTicket} className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                Submit Ticket
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </DashboardPageLayout>
    );
}

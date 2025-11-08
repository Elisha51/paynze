
'use client';
import { useState, useEffect } from 'react';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Send, LifeBuoy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.length > 0 ? tickets.map(ticket => (
                                        <TableRow key={ticket.id}>
                                            <TableCell className="font-mono">{ticket.id}</TableCell>
                                            <TableCell className="font-medium">{ticket.subject}</TableCell>
                                            <TableCell>
                                                <Badge variant={ticket.status === 'Resolved' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                                            </TableCell>
                                            <TableCell>{format(new Date(ticket.lastUpdated), 'PPP')}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">You have no support tickets.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
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

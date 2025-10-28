
'use client';
import { useState } from 'react';
import type { Customer, Communication, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Phone, Users, ShoppingCart, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type CustomerActivityLogProps = {
  customer: Customer;
};

type InteractionType = 'Note' | 'Phone' | 'Meeting' | 'Message';

const iconMap: { [key: string]: React.ElementType } = {
  Note: MessageSquare,
  Phone: Phone,
  Meeting: Users,
  Message: MessageSquare,
  order: ShoppingCart,
  add: PlusCircle,
};

export function CustomerActivityLog({ customer }: CustomerActivityLogProps) {
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState<InteractionType>('Note');
  const [communications, setCommunications] = useState<Communication[]>(customer.communications || []);
  const { toast } = useToast();

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast({
        variant: 'destructive',
        title: 'Note cannot be empty',
      });
      return;
    }
    const newComm: Communication = {
      id: `comm_${Date.now()}`,
      type: interactionType,
      content: newNote,
      date: new Date().toISOString(),
      staffId: 'staff-001', // Logged in user
      staffName: 'Admin',
    };

    setCommunications(prev => [newComm, ...prev]);
    setNewNote('');
    toast({ title: 'Note Added' });
    // In a real app, this would call a service to save the communication
  };
  
  const allActivities = [
      ...communications.map(c => ({...c, activityType: 'communication'})),
      ...(customer.orders || []).map(o => ({...o, activityType: 'order'}))
  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const TimelineItem = ({ activity, isLast }: { activity: any, isLast: boolean }) => {
    const isCommunication = activity.activityType === 'communication';
    let Icon, title, content, iconKey;

    if (isCommunication) {
        const comm = activity as Communication;
        iconKey = comm.type;
        Icon = iconMap[comm.type];
        title = `Logged a ${comm.type.toLowerCase()} by ${comm.staffName}`;
        content = comm.content;
    } else {
        const order = activity as Order;
        iconKey = 'order';
        Icon = ShoppingCart;
        title = `Order #${order.id} placed`;
        content = `Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency }).format(order.total)}`;
    }

    return (
        <div className="relative pl-8">
            {!isLast && <div className="absolute left-3 top-8 h-full w-0.5 bg-border" />}
             <div className="absolute top-2 -left-[30px]">
                <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                    <AvatarFallback>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="space-y-1 pb-8">
                <p className="text-xs text-muted-foreground">{format(new Date(activity.date), 'PPP p')}</p>
                <p className="text-sm font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{content}</p>
            </div>
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity &amp; Notes</CardTitle>
        <CardDescription>A log of all interactions and orders related to this customer.</CardDescription>
      </CardHeader>
      <CardContent>
          <div className="relative pl-8">
              <div className="absolute left-3 top-8 h-full w-0.5 bg-border" />
              <div className="absolute top-2 -left-[30px]">
                <Avatar className="h-8 w-8 border-2 border-background bg-primary/10">
                    <AvatarFallback className="bg-transparent">
                        <PlusCircle className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-4 pb-8">
                <Textarea
                    placeholder="Add a note or log an interaction..."
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                    <Select value={interactionType} onValueChange={v => setInteractionType(v as InteractionType)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Note"><MessageSquare className="mr-2 h-4 w-4" />Log a Note</SelectItem>
                            <SelectItem value="Phone"><Phone className="mr-2 h-4 w-4" />Log a Call</SelectItem>
                            <SelectItem value="Meeting"><Users className="mr-2 h-4 w-4" />Log a Meeting</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAddNote} disabled={!newNote}>
                        Save Note
                    </Button>
                </div>
              </div>
          </div>

          {allActivities.map((activity, index) => (
              <TimelineItem 
                key={`${activity.id}-${index}`} 
                activity={activity} 
                isLast={index === allActivities.length - 1} 
              />
          ))}
      </CardContent>
    </Card>
  );
}

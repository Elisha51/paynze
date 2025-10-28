
'use client';
import { useState, useMemo } from 'react';
import type { Customer, Communication, Order } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Phone, Users, ShoppingCart, PlusCircle, FileText, ShoppingBag } from 'lucide-react';
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
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

type CustomerActivityLogProps = {
  customer: Customer;
};

type InteractionType = 'Note' | 'Phone' | 'Meeting';
type ActivityType = 'all' | 'order' | 'communication';

type UnifiedActivity = (Communication & { activityType: 'communication' }) | (Order & { activityType: 'order' });


const iconMap: { [key: string]: React.ElementType } = {
  Note: MessageSquare,
  Phone: Phone,
  Meeting: Users,
  order: ShoppingBag,
  add: PlusCircle,
};

const ITEMS_PER_PAGE = 10;

export function CustomerActivityLog({ customer }: CustomerActivityLogProps) {
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState<InteractionType>('Note');
  const [communications, setCommunications] = useState<Communication[]>(customer.communications || []);
  const [filter, setFilter] = useState<ActivityType>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
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
  
  const allActivities: UnifiedActivity[] = useMemo(() => {
    const comms = communications.map(c => ({...c, activityType: 'communication' as const}));
    const orders = (customer.orders || []).map(o => ({...o, activityType: 'order' as const}));
    return [...comms, ...orders].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [communications, customer.orders]);

  const filteredActivities = useMemo(() => {
      if (filter === 'all') return allActivities;
      return allActivities.filter(activity => activity.activityType === filter);
  }, [allActivities, filter]);

  const visibleActivities = filteredActivities.slice(0, visibleCount);

  const TimelineItem = ({ activity, isLast }: { activity: UnifiedActivity, isLast: boolean }) => {
    let Icon, title, content;

    if (activity.activityType === 'communication') {
        Icon = iconMap[activity.type];
        title = `Logged a ${activity.type.toLowerCase()} by ${activity.staffName}`;
        content = activity.content;
    } else { // Order
        Icon = ShoppingBag;
        title = `Order #${activity.id} placed`;
        content = `Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.total)}`;
    }

    return (
        <div className="relative pl-8">
            {!isLast && <div className="absolute left-3 top-3 h-full w-0.5 bg-border" />}
             <div className="absolute -left-[1px] top-0">
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
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>A log of all interactions and orders related to this customer.</CardDescription>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as ActivityType)} className="w-full pt-2">
            <TabsList>
                <TabsTrigger value="all">All Activity</TabsTrigger>
                <TabsTrigger value="order">Orders</TabsTrigger>
                <TabsTrigger value="communication">Notes & Activity</TabsTrigger>
            </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
          <div className="relative pl-8">
              <div className="absolute left-3 top-3 h-full w-0.5 bg-border" />
              <div className="absolute -left-[1px] top-0">
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

          {visibleActivities.length > 0 ? visibleActivities.map((activity, index) => (
              <TimelineItem 
                key={`${activity.id}-${index}`} 
                activity={activity} 
                isLast={index === visibleActivities.length - 1} 
              />
          )) : (
            <div className="text-center py-10">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No activities found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no activities matching the current filter.</p>
            </div>
          )}

          {filteredActivities.length > visibleCount && (
              <div className="text-center mt-4">
                  <Button variant="outline" onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}>
                      Load More
                  </Button>
              </div>
          )}
      </CardContent>
    </Card>
  );
}

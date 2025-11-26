
'use client';
import { useState, useMemo } from 'react';
import type { Customer, Communication, Order, DeliveryNote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare, Phone, Users, ShoppingBag, CornerDownRight, ChevronDown, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { EmptyState } from '../ui/empty-state';
import { FileText } from 'lucide-react';

type CustomerActivityLogProps = {
  customer: Customer;
};

type InteractionType = 'Note' | 'Phone' | 'Meeting';
type ActivityType = 'all' | 'order' | 'communication';

type UnifiedActivity = 
    | (Communication & { activityType: 'communication'; replies?: Communication[] }) 
    | (Order & { activityType: 'order' })
    | (DeliveryNote & { activityType: 'delivery_note'; orderId: string });

const iconMap: { [key: string]: React.ElementType } = {
  Note: MessageSquare,
  Phone: Phone,
  Meeting: Users,
  order: ShoppingBag,
  delivery_note: Truck,
};

const ITEMS_PER_PAGE = 10;

export function CustomerActivityLog({ customer }: CustomerActivityLogProps) {
  const [newNote, setNewNote] = useState('');
  const [interactionType, setInteractionType] = useState<InteractionType>('Note');
  const [communications, setCommunications] = useState<Communication[]>(customer.communications || []);
  const [filter, setFilter] = useState<ActivityType>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<string[]>([]);
  const { toast } = useToast();

  const handleAddCommunication = (content: string, threadId?: string) => {
    if (!content.trim()) {
      toast({ variant: 'destructive', title: 'Content cannot be empty' });
      return;
    }
    
    const newComm: Communication = {
      id: `comm_${Date.now()}`,
      type: threadId ? 'Note' : interactionType,
      content,
      date: new Date().toISOString(),
      staffId: 'staff-001', // Logged in user
      staffName: 'Admin',
      ...(threadId && { threadId }),
    };

    setCommunications(prev => [newComm, ...prev]);

    if (threadId) {
      setReplyingTo(null);
      toast({ title: 'Reply Added' });
    } else {
      setNewNote('');
      toast({ title: `${interactionType} Logged` });
    }
  };

  const allActivities: UnifiedActivity[] = useMemo(() => {
    const topLevelComms = communications.filter(c => !c.threadId);
    const replies = communications.filter(c => c.threadId);

    const commsWithReplies: UnifiedActivity[] = topLevelComms.map(comm => ({
        ...comm,
        activityType: 'communication' as const,
        replies: replies.filter(r => r.threadId === comm.id).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }));

    const orders: UnifiedActivity[] = (customer.orders || []).map(o => ({...o, activityType: 'order' as const}));

    const deliveryNotes: UnifiedActivity[] = (customer.orders || []).flatMap(order => 
        (order.deliveryNotes || []).map(note => ({
            ...note,
            activityType: 'delivery_note' as const,
            orderId: order.id,
        }))
    );
    
    return [...commsWithReplies, ...orders, ...deliveryNotes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [communications, customer.orders]);

  const filteredActivities = useMemo(() => {
    if (filter === 'all') return allActivities;
    if (filter === 'order') return allActivities.filter(a => a.activityType === 'order' || a.activityType === 'delivery_note');
    return allActivities.filter(activity => activity.activityType === filter);
  }, [allActivities, filter]);

  const visibleActivities = filteredActivities.slice(0, visibleCount);

  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => 
        prev.includes(threadId) 
            ? prev.filter(id => id !== threadId)
            : [...prev, threadId]
    );
  };
  
  const placeholderMap = {
      Note: "Add a note...",
      Phone: "Log a call...",
      Meeting: "Log a meeting..."
  }

  const ReplyForm = ({ parentId }: { parentId: string}) => {
    const [replyContent, setReplyContent] = useState('');
    return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="ml-8 mt-4 space-y-2">
        <Textarea
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="min-h-[60px]"
        />
        <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
            <Button size="sm" onClick={() => handleAddCommunication(replyContent, parentId)}>Save Reply</Button>
        </div>
        </motion.div>
    );
  };

  const TimelineItem = ({ activity, isLast }: { activity: UnifiedActivity, isLast: boolean }) => {
    let Icon, title, content, replies, orderId;
    const isExpanded = activity.activityType === 'communication' && expandedThreads.includes(activity.id);

    if (activity.activityType === 'communication') {
        Icon = iconMap[activity.type];
        title = `Logged a ${activity.type.toLowerCase()} by ${activity.staffName}`;
        content = activity.content;
        replies = activity.replies;
    } else if (activity.activityType === 'order') {
        Icon = ShoppingBag;
        title = `Order #${activity.id} placed`;
        content = `Total: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: activity.currency }).format(activity.total)}`;
        orderId = activity.id;
    } else { // Delivery Note
        Icon = Truck;
        title = `Delivery update by ${activity.staffName}`;
        content = activity.note;
        orderId = activity.orderId;
    }

    return (
        <div className="relative pl-8">
            {!isLast && <div className="absolute left-3 top-3 h-full w-0.5 bg-border" />}
             <div className="absolute -left-px top-0">
                <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                    <AvatarFallback>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>
            </div>
            <div className="space-y-1 pb-8">
                <p className="text-xs text-muted-foreground">{format(new Date(activity.date), 'PPP p')}</p>
                <div className="text-sm font-medium">
                  {orderId ? (
                    <Link href={`/dashboard/orders/${orderId}`} className="hover:underline">{title}</Link>
                  ) : (
                    <span>{title}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
                
                <div className="flex items-center gap-2">
                    {activity.activityType === 'communication' && (
                      <Button variant="ghost" size="sm" className="h-auto p-1 -ml-1 text-xs" onClick={() => setReplyingTo(replyingTo === activity.id ? null : activity.id)}>
                        <CornerDownRight className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}
                    {replies && replies.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-auto p-1 text-xs" onClick={() => toggleThread(activity.id)}>
                            <ChevronDown className={cn("h-3 w-3 mr-1 transition-transform", isExpanded && "rotate-180")} />
                            {isExpanded ? 'Hide' : 'Show'} {replies.length} repl{replies.length > 1 ? 'ies' : 'y'}
                        </Button>
                    )}
                </div>

                 <AnimatePresence>
                 {isExpanded && replies && replies.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4 space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3 ml-4 pl-4 border-l">
                         <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{reply.staffName.substring(0, 1)}</AvatarFallback>
                         </Avatar>
                         <div className="flex-1">
                            <p className="text-xs text-muted-foreground">{reply.staffName} &middot; {format(new Date(reply.date), 'PP p')}</p>
                            <p className="text-sm">{reply.content}</p>
                         </div>
                      </div>
                    ))}
                  </motion.div>
                 )}
                </AnimatePresence>

                <AnimatePresence>
                  {replyingTo === activity.id && <ReplyForm parentId={activity.id} />}
                </AnimatePresence>
            </div>
        </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>A log of all interactions and orders related to this customer.</CardDescription>
      </CardHeader>
      <CardContent>
          <Card className="mb-6 bg-muted/50">
            <CardHeader className="p-3">
                 <Tabs value={interactionType} onValueChange={(v) => setInteractionType(v as InteractionType)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="Note"><MessageSquare className="mr-2 h-4 w-4" />Log a Note</TabsTrigger>
                        <TabsTrigger value="Phone"><Phone className="mr-2 h-4 w-4" />Log a Call</TabsTrigger>
                        <TabsTrigger value="Meeting"><Users className="mr-2 h-4 w-4" />Log a Meeting</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="space-y-3">
                    <Textarea
                        placeholder={placeholderMap[interactionType]}
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        className="min-h-[80px] bg-background"
                    />
                    <div className="flex justify-end">
                        <Button onClick={() => handleAddCommunication(newNote)} disabled={!newNote}>
                            Save {interactionType}
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        
        <Tabs value={filter} onValueChange={(value) => setFilter(value as ActivityType)} className="w-full mb-4">
            <TabsList>
                <TabsTrigger value="all">All Activity</TabsTrigger>
                <TabsTrigger value="order">Orders</TabsTrigger>
                <TabsTrigger value="communication">Notes & Activity</TabsTrigger>
            </TabsList>
        </Tabs>

          {visibleActivities.length > 0 ? visibleActivities.map((activity, index) => (
              <TimelineItem 
                key={`${activity.id}-${index}`} 
                activity={activity} 
                isLast={index === visibleActivities.length - 1} 
              />
          )) : (
            <EmptyState
              icon={<FileText className="h-12 w-12 text-muted-foreground" />}
              title="No Activities Found"
              description="There are no activities matching the current filter."
            />
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

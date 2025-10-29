

'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Edit, MessageCircle, Phone, Tag, Send } from 'lucide-react';
import Link from 'next/link';
import { getCustomerById } from '@/services/customers';
import type { Customer, OnboardingFormData } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { classifyCustomer, ClassifyCustomerOutput } from '@/ai/flows/classify-customers';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerActivityLog } from '@/components/dashboard/customer-activity-log';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type MessageType = 'WhatsApp' | 'SMS' | null;

export default function ViewCustomerPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [classification, setClassification] = useState<ClassifyCustomerOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClassifying, setIsClassifying] = useState(false);
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [messageContent, setMessageContent] = useState('');

  const loadCustomerData = async () => {
    if (!id) return;
    setLoading(true);
    try {
        const fetchedCustomer = await getCustomerById(id);
        setCustomer(fetchedCustomer || null);
    } catch (error) {
        console.error("Failed to fetch customer data:", error);
        setCustomer(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    loadCustomerData();
  }, [id]);

  useEffect(() => {
      async function runClassification() {
          if (customer && customer.orders && customer.orders.length > 0) {
              setIsClassifying(true);
              const purchaseHistory = customer.orders.flatMap(order => 
                  order.items.map(item => ({
                      productId: item.sku,
                      quantity: item.quantity,
                      price: item.price,
                      category: item.category || 'Unknown',
                      timestamp: order.date,
                  }))
              );

              try {
                const classificationResult = await classifyCustomer({
                    customerId: customer.id,
                    purchaseHistory: purchaseHistory,
                });
                setClassification(classificationResult);
              } catch (error) {
                console.error("AI flow 'classifyCustomer' is offline:", error);
                // Optionally set an error state to show in the UI
              } finally {
                setIsClassifying(false);
              }
          }
      }
      runClassification();
  }, [customer]);
  
  const handleOpenMessageDialog = (type: MessageType) => {
    setMessageType(type);
    setIsMessageDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) {
        toast({ variant: 'destructive', title: 'Message cannot be empty.' });
        return;
    }
    // Simulate sending message and updating activity log
    console.log(`Sending ${messageType} to ${customer?.name}: ${messageContent}`);
    
    // In a real app, you would add this communication to the customer's record in the backend.
    // For this simulation, we'll just reload the customer data to mimic the update.
    // A more sophisticated approach would be to update the state locally.
    loadCustomerData();
    
    toast({ title: 'Message Sent', description: `Your ${messageType} has been sent to ${customer?.name}.` });
    setIsMessageDialogOpen(false);
    setMessageContent('');
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Customer not found</h1>
            <p className="text-muted-foreground">The customer you are looking for does not exist.</p>
            <Button asChild className="mt-4">
                <Link href="/dashboard/customers">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Customers
                </Link>
            </Button>
        </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const totalOrders = customer.orders?.length || 0;
  const totalSpend = customer.orders?.reduce((sum, order) => sum + order.total, 0) || 0;


  return (
    <>
    <div className="space-y-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Customers</span>
          </Link>
        </Button>
         <Avatar className="h-16 w-16">
            <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
         </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {customer.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Customer since {new Date(customer.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/customers/${customer.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => handleOpenMessageDialog('WhatsApp')}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send WhatsApp
                    </DropdownMenuItem>
                     <DropdownMenuItem onSelect={() => handleOpenMessageDialog('SMS')}>
                        <Phone className="mr-2 h-4 w-4" />
                        Send SMS
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <CustomerActivityLog customer={customer} />
        </div>

        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Spend</span>
                        <span className="font-semibold">{formatCurrency(totalSpend, settings?.currency || 'UGX')}</span>
                     </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Orders</span>
                        <span className="font-semibold">{totalOrders}</span>
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p><strong>Email:</strong> {customer.email}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <div className="pt-2">
                        <p className="font-medium">Shipping Address</p>
                        <address className="text-muted-foreground not-italic">
                            123 Main Street<br/>
                            Nairobi, 12345<br/>
                            Kenya
                        </address>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Tag className="h-5 w-5" /> Customer Tagging
                    </CardTitle>
                    <CardDescription>AI-powered classification based on purchase history.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isClassifying ? (
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    ) : classification ? (
                        <div className="space-y-2">
                            <Badge variant="secondary" className="text-base">{classification.customerGroup}</Badge>
                            <p className="text-sm text-muted-foreground">{classification.reason}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Not enough data to classify this customer yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
    <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Send {messageType} to {customer.name}</DialogTitle>
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

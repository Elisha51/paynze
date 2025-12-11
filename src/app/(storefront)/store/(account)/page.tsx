
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Customer, Order } from '@/lib/types';
import { getCustomerById } from '@/services/customers';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Package, User } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ElementType }) => {
    const Icon = icon;
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    )
};

export default function AccountOverviewPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
      if (!loggedInCustomerId) {
        setLoading(false);
        router.push('/store/login');
        return;
      }
      
      const cust = await getCustomerById(loggedInCustomerId);
      setCustomer(cust || null);
      setLoading(false);
    }
    loadData();
  }, [router]);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-48 w-full" />
        </div>
    );
  }

  if (!customer) {
      return (
          <Card>
              <CardHeader><CardTitle>Error</CardTitle></CardHeader>
              <CardContent><p>Could not load customer profile.</p></CardContent>
          </Card>
      )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  const recentOrder = customer.orders && customer.orders.length > 0
    ? [...customer.orders].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {customer.name.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's a quick overview of your account.</p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard title="Lifetime Spend" value={formatCurrency(customer.totalSpend, customer.currency)} icon={Package} />
            <StatCard title="Total Orders" value={customer.orders?.length || 0} icon={User} />
        </div>
        
        {recentOrder ? (
            <Card>
                <CardHeader>
                    <CardTitle>Most Recent Order</CardTitle>
                    <CardDescription>
                        Order #{recentOrder.id} &middot; Placed {formatDistanceToNow(new Date(recentOrder.date), { addSuffix: true })}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold">{recentOrder.items.length} item(s)</p>
                            <p className="text-muted-foreground">{formatCurrency(recentOrder.total, recentOrder.currency)}</p>
                        </div>
                        <Badge>{recentOrder.status}</Badge>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="ml-auto">
                        <Link href={`/store/account/orders/${recentOrder.id}`}>
                            View Details <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        ) : (
             <Card>
                <CardHeader>
                    <CardTitle>No Orders Yet</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You haven't placed any orders yet. Start shopping to see your order history here.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild>
                        <Link href="/store">Start Shopping</Link>
                    </Button>
                </CardFooter>
            </Card>
        )}
    </div>
  );
}

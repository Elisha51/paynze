
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, User, ShoppingCart, CheckCircle, Target, DollarSign, List, FileText } from 'lucide-react';
import type { Staff, Order } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const StaffCard = ({ member }: { member: Staff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };
  
  const QuickViewModal = () => (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>{member.name}</DialogTitle>
                <DialogDescription>
                    {member.role} - <span className={cn('font-semibold', member.onlineStatus === 'Online' ? 'text-green-600' : 'text-muted-foreground')}>{member.onlineStatus}</span>
                </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Performance</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {member.completionRate && (
                            <div className="space-y-4">
                                <div className="text-2xl font-bold">{member.completionRate}%</div>
                                <p className="text-xs text-muted-foreground">Order Completion Rate</p>
                                <Progress value={member.completionRate} />
                            </div>
                        )}
                        {member.totalSales && (
                            <div className="space-y-2 mt-4">
                                <p className="text-sm font-medium">Total Sales</p>
                                <p className="text-2xl font-bold">{formatCurrency(member.totalSales, member.currency || 'UGX')}</p>
                            </div>
                        )}
                         {!member.completionRate && !member.totalSales && (
                            <p className="text-sm text-muted-foreground">No performance data available.</p>
                        )}
                    </CardContent>
                 </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Current Assignments</CardTitle>
                        <List className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {member.assignedOrders && member.assignedOrders.length > 0 ? (
                             <ul className="space-y-2">
                                {member.assignedOrders.map(order => (
                                    <li key={order.id} className="text-sm">
                                        <Link href={`/dashboard/orders/${order.id}`} className="font-medium text-primary hover:underline">{order.id}</Link>
                                        <p className="text-xs text-muted-foreground">{order.customerName} - {formatCurrency(order.total, order.currency)}</p>
                                    </li>
                                ))}
                             </ul>
                         ) : (
                             <p className="text-sm text-muted-foreground">No orders currently assigned.</p>
                         )}
                    </CardContent>
                 </Card>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
                <Button asChild>
                    <Link href={`/dashboard/staff/${member.id}`}>
                        <FileText className="mr-2 h-4 w-4" /> View Full Profile
                    </Link>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Card
        className="flex flex-col"
        onClick={() => setIsModalOpen(true)}
      >
        <CardHeader className="flex-row items-start justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
             <div className="relative">
                <User className="h-10 w-10 text-muted-foreground" />
                <span className={cn(
                    "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background",
                    member.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'
                )}></span>
             </div>
             <div>
                <CardTitle className="text-base font-semibold">{member.name}</CardTitle>
                <CardDescription>{member.role}</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-3">
          <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center h-full flex flex-col justify-center items-center">
            <p className="text-sm font-semibold">
                {member.assignedOrders?.length || 0} Assigned Order(s)
            </p>
            <p className="text-xs text-muted-foreground mt-1">Drag an order here to assign</p>
          </div>
        </CardContent>
      </Card>
      <QuickViewModal />
    </>
  );
};

export function StaffWidget({ staff, isLoading }: { staff: Staff[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex-row items-center gap-4 pb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {staff.map(member => (
        <StaffCard key={member.id} member={member} />
      ))}
    </div>
  );
}


'use client';

import { PlusCircle, BarChart, DollarSign, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import type { Staff, Role, Order, StaffActivity, OnboardingFormData } from '@/lib/types';
import { getStaff, addStaff as serviceAddStaff, updateStaff } from '@/services/staff';
import { RolesPermissionsTab } from '@/components/dashboard/roles-permissions-tab';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRoles } from '@/services/roles';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StaffCard } from '@/components/dashboard/staff-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrders } from '@/services/orders';
import { StaffActivityLog } from '@/components/dashboard/staff-activity-log';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';


const emptyStaff: Omit<Staff, 'id'> = {
  name: '',
  email: '',
  role: 'Sales Agent',
  status: 'Pending Verification',
};

export default function StaffPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const activeTab = searchParams.get('tab') || 'staff';

  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newStaffMember, setNewStaffMember] = React.useState<Partial<Staff>>(emptyStaff);
  const [addMode, setAddMode] = React.useState<'invite' | 'manual'>('invite');
  const [bonusStaff, setBonusStaff] = React.useState<Staff | null>(null);
  const [bonusAmount, setBonusAmount] = React.useState<number>(0);
  const [bonusReason, setBonusReason] = React.useState('');
  const [settings, setSettings] = React.useState<OnboardingFormData | null>(null);
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [fetchedStaff, fetchedRoles, fetchedOrders] = await Promise.all([getStaff(), getRoles(), getOrders()]);
    setStaff(fetchedStaff);
    setRoles(fetchedRoles);
    setOrders(fetchedOrders);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
    loadData();
  }, [loadData]);
  
  const handleTabChange = (tab: string) => {
    router.push(`${pathname}?tab=${tab}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewStaffMember(prev => ({...prev, [id]: value}));
  };
  
  const handleRoleChange = (value: Staff['role']) => {
    setNewStaffMember(prev => ({...prev, role: value}));
  }

  const handleAddStaff = async () => {
    if (!newStaffMember.email) {
      toast({ variant: 'destructive', title: 'Email is required.'});
      return;
    }
    if (addMode === 'manual' && !newStaffMember.name) {
        toast({ variant: 'destructive', title: 'Name is required for manual creation.'});
        return;
    }

    const staffToAdd: Omit<Staff, 'id'> = {
        name: newStaffMember.name || '',
        email: newStaffMember.email,
        role: newStaffMember.role || 'Sales Agent',
        status: addMode === 'manual' ? 'Pending Verification' : 'Active', // Or some 'Invited' status
    };

    await serviceAddStaff(staffToAdd);
    toast({ title: addMode === 'invite' ? 'Invitation Sent' : 'Staff Member Added'});
    setIsAddOpen(false);
    setNewStaffMember(emptyStaff);
    loadData();
  }

  const handleAwardBonus = async () => {
      if (!bonusStaff || bonusAmount <= 0) {
          toast({ variant: 'destructive', title: 'Invalid bonus amount' });
          return;
      }
      
      const newBonus = {
          id: `bonus-${Date.now()}`,
          date: new Date().toISOString(),
          reason: bonusReason || 'Performance Bonus',
          amount: bonusAmount,
          awardedBy: user?.name || 'Admin',
      };
      
      const updatedStaff = {
          ...bonusStaff,
          totalCommission: (bonusStaff.totalCommission || 0) + bonusAmount,
          bonuses: [...(bonusStaff.bonuses || []), newBonus],
      };
      
      await updateStaff(updatedStaff);
      toast({ title: 'Bonus Awarded!', description: `${bonusStaff.name} has been awarded a bonus for ${formatCurrency(bonusAmount, bonusStaff.currency || 'UGX')}.`});
      setBonusStaff(null);
      setBonusAmount(0);
      setBonusReason('');
      loadData();
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }


  const mainTabs = [
      { value: 'staff', label: 'Staff' },
      { value: 'permissions', label: 'Roles &amp; Permissions' },
      { value: 'all-logs', label: 'All Logs' },
      { value: 'analytics', label: 'Analytics' },
  ];

  const canAddStaff = user?.permissions.staff.create;

  const cta = (
    canAddStaff ? (
     <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Staff
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a new staff member</DialogTitle>
                <DialogDescription>Choose how you want to add a new member to your team.</DialogDescription>
            </DialogHeader>
             <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant={addMode === 'invite' ? 'default' : 'outline'} onClick={() => setAddMode('invite')}>Invite Staff</Button>
                <Button variant={addMode === 'manual' ? 'default' : 'outline'} onClick={() => setAddMode('manual')}>Add Manually</Button>
            </div>

            {addMode === 'invite' ? (
                <div className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">Send an email invitation for the new staff member to create their own account and password.</p>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="colleague@example.com" value={newStaffMember.email || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newStaffMember.role} onValueChange={handleRoleChange}>
                            <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                {roles.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     </div>
                </div>
            ) : (
                <div className="space-y-4 py-4">
                     <p className="text-sm text-muted-foreground">Create a profile and set a temporary password for the new staff member. They will require verification before they can log in.</p>
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={newStaffMember.name || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={newStaffMember.email || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newStaffMember.role} onValueChange={handleRoleChange}>
                            <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                {roles.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAddStaff}>{addMode === 'invite' ? 'Send Invitation' : 'Add Staff Member'}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    ) : null
  );

  return (
    <>
    <DashboardPageLayout 
        title="Staff Management" 
        tabs={mainTabs} 
        cta={cta} 
        activeTab={activeTab}
        onTabChange={handleTabChange}
    >
        <DashboardPageLayout.TabContent value="staff">
            {isLoading ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {staff.map(member => (
                        <StaffCard key={member.id} member={member} onAwardBonus={() => setBonusStaff(member)} />
                    ))}
                </div>
            )}
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="permissions">
            <RolesPermissionsTab roles={roles} setRoles={setRoles} />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="all-logs">
            <StaffActivityLog staff={staff} />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="analytics">
            <Card>
                <CardHeader>
                    <CardTitle>Staff Analytics</CardTitle>
                    <CardDescription>Analyze performance and activity across your team.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
                        <div className="bg-primary/10 p-4 rounded-full">
                           <BarChart className="h-12 w-12 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">Coming Soon</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Detailed staff performance reports and analytics will be available here.</p>
                    </div>
                </CardContent>
            </Card>
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>

     <Dialog open={!!bonusStaff} onOpenChange={(isOpen) => !isOpen && setBonusStaff(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Award Bonus to {bonusStaff?.name}</DialogTitle>
            <DialogDescription>
              Grant a one-time bonus for exceptional performance or other reasons. This will be added to their next payout.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="bonusAmount">Bonus Amount ({settings?.currency || bonusStaff?.currency})</Label>
              <Input
                id="bonusAmount"
                type="number"
                value={bonusAmount}
                onChange={(e) => setBonusAmount(Number(e.target.value))}
                placeholder="e.g., 50000"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="bonusReason">Reason (Optional)</Label>
              <Input
                id="bonusReason"
                value={bonusReason}
                onChange={(e) => setBonusReason(e.target.value)}
                placeholder="e.g., Exceeded monthly sales target"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleAwardBonus}>
              <DollarSign className="mr-2 h-4 w-4" />
              Award Bonus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

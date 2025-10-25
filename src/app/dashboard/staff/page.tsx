

'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import type { Staff, Role } from '@/lib/types';
import { getStaff, addStaff as serviceAddStaff } from '@/services/staff';
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
import { CommissionReport } from '@/components/dashboard/commission-report';

const emptyStaff: Omit<Staff, 'id'> = {
  name: '',
  email: '',
  role: 'Sales Agent',
  status: 'Pending Verification',
};

export default function StaffPage() {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('team');
  const [newStaffMember, setNewStaffMember] = React.useState<Partial<Staff>>(emptyStaff);
  const [addMode, setAddMode] = React.useState<'invite' | 'manual'>('invite');
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const [fetchedStaff, fetchedRoles] = await Promise.all([getStaff(), getRoles()]);
    setStaff(fetchedStaff);
    setRoles(fetchedRoles);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
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


  const mainTabs = [
      { value: 'team', label: 'Your Team' },
      { value: 'permissions', label: 'Roles & Permissions' },
      { value: 'reports', label: 'Reports' },
  ];

  const cta = (
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
                        <Input id="email" type="email" placeholder="colleague@example.com" value={newStaffMember.email} onChange={handleInputChange} />
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
                        <Input id="name" value={newStaffMember.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={newStaffMember.email} onChange={handleInputChange} />
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
  );

  return (
    <DashboardPageLayout 
        title="Staff Management" 
        tabs={mainTabs} 
        cta={cta} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
    >
        <DashboardPageLayout.TabContent value="team">
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
                        <StaffCard key={member.id} member={member} />
                    ))}
                </div>
            )}
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="permissions">
            <RolesPermissionsTab roles={roles} setRoles={setRoles} />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="reports">
            <CommissionReport staff={staff} roles={roles} onPayout={loadData} />
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}

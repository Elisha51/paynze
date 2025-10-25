
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/dashboard/data-table';
import type { Staff, Role } from '@/lib/types';
import { getStaff, addStaff as serviceAddStaff } from '@/services/staff';
import Link from 'next/link';
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

const columns: ColumnDef<Staff>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { 
    accessorKey: 'role', 
    header: 'Role',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('role')}</Badge>
  },
  {
    accessorKey: 'lastLogin',
    header: 'Last Login',
  },
  { 
    accessorKey: 'status', 
    header: 'Status',
    cell: ({ row }) => <Badge variant={row.getValue('status') === 'Active' ? 'default' : 'secondary'}>{row.getValue('status')}</Badge>
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const staffMember = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild><Link href={`/dashboard/staff/${staffMember.id}/edit`}>Edit Details</Link></DropdownMenuItem>
              <DropdownMenuItem>View Performance</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
  },
];

const emptyStaff: Omit<Staff, 'id'> = {
  name: '',
  email: '',
  role: 'Sales Agent',
  status: 'Active',
};

export default function StaffPage() {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newStaffMember, setNewStaffMember] = React.useState(emptyStaff);
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

    await serviceAddStaff(newStaffMember);
    toast({ title: addMode === 'invite' ? 'Invitation Sent' : 'Staff Member Added'});
    setIsAddOpen(false);
    setNewStaffMember(emptyStaff);
    loadData();
  }


  const mainTabs = [
      { value: 'team', label: 'Your Team' },
      { value: 'permissions', label: 'Roles & Permissions' },
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
                     <p className="text-sm text-muted-foreground">Create a profile and set a temporary password for the new staff member.</p>
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
    <DashboardPageLayout title="Staff Management" tabs={mainTabs} cta={cta}>
        <DashboardPageLayout.TabContent value="team">
            <DataTable columns={columns} data={staff} />
        </DashboardPageLayout.TabContent>
        <DashboardPageLayout.TabContent value="permissions">
            <RolesPermissionsTab roles={roles} setRoles={setRoles} />
        </DashboardPageLayout.TabContent>
    </DashboardPageLayout>
  );
}

    
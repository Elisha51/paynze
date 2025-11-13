
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Customer, CustomerGroup } from '@/lib/types';
import { getCustomerGroups, addCustomerGroup, updateCustomerGroup, deleteCustomerGroup } from '@/services/customer-groups';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

export function CustomerGroupsTab({ customers, isLoading: isLoadingCustomers }: { customers: Customer[], isLoading: boolean }) {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const canEdit = user?.permissions.customers.edit;

  const loadData = useCallback(async () => {
    setIsLoadingGroups(true);
    const fetchedData = await getCustomerGroups();
    setGroups(fetchedData);
    setIsLoadingGroups(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const customer of customers) {
        counts[customer.customerGroup] = (counts[customer.customerGroup] || 0) + 1;
    }
    return counts;
  }, [customers]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) {
      toast({ variant: 'destructive', title: 'Group name is required.' });
      return;
    }
    await addCustomerGroup({ name: newGroupName });
    toast({ title: 'Customer Group Added' });
    setIsAddOpen(false);
    setNewGroupName('');
    loadData();
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup || !editingGroup.name.trim()) {
      toast({ variant: 'destructive', title: 'Group name is required.' });
      return;
    }
    await updateCustomerGroup(editingGroup);
    toast({ title: 'Customer Group Updated' });
    setIsEditOpen(false);
    setEditingGroup(null);
    loadData();
  };

  const handleDeleteGroup = async (groupId: string) => {
    await deleteCustomerGroup(groupId);
    toast({ title: 'Customer Group Deleted', variant: 'destructive' });
    loadData();
  };
  
  const openEditDialog = (group: CustomerGroup) => {
    setEditingGroup(group);
    setIsEditOpen(true);
  }
  
  if (!user) {
      return <div>Loading...</div>;
  }
  
  const isLoading = isLoadingGroups || isLoadingCustomers;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Customer Groups</h2>
            <p className="text-muted-foreground">Organize your customers into groups for targeted marketing and pricing.</p>
        </div>
        {canEdit && (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer Group</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="new-group-name">Group Name</Label>
                  <Input
                    id="new-group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., VIP Customers"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                  <Button onClick={handleAddGroup}>Add Group</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : (
                groups.map(group => (
                    <Card key={group.id} className="hover:bg-muted/50 transition-colors">
                        <Link href={`/dashboard/customers?group=${encodeURIComponent(group.name)}`} className="flex flex-col h-full">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                {canEdit && (
                                    <AlertDialog>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.preventDefault()}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); openEditDialog(group); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will delete the "{group.name}" group. This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteGroup(group.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </CardHeader>
                            <CardContent className="flex-1 flex items-end">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-5 w-5" />
                                    <span className="font-bold text-xl text-foreground">{groupCounts[group.name] || 0}</span>
                                    <span>customer{groupCounts[group.name] !== 1 && 's'}</span>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                ))
            )}
       </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-group-name">Group Name</Label>
            <Input
              id="edit-group-name"
              value={editingGroup?.name || ''}
              onChange={(e) => setEditingGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleUpdateGroup}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CustomerGroup } from '@/lib/types';
import { getCustomerGroups, addCustomerGroup, updateCustomerGroup, deleteCustomerGroup } from '@/services/customer-groups';
import { useAuth } from '@/context/auth-context';

export function CustomerGroupsTab() {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const canEdit = user?.permissions.customers.edit;

  const loadData = useCallback(async () => {
    const fetchedData = await getCustomerGroups();
    setGroups(fetchedData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Groups</CardTitle>
            <CardDescription>Organize your customers into groups for targeted marketing and pricing.</CardDescription>
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
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-md border">
            {groups.map(group => (
              <div key={group.id} className="flex items-center justify-between p-3">
                <span className="font-medium">{group.name}</span>
                {canEdit && (
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => openEditDialog(group)}>
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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

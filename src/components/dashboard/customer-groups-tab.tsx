
'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { PlusCircle, MoreHorizontal, Edit, Trash2, Users, ArrowLeft, Bot, Loader2 } from 'lucide-react';
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
import { Skeleton } from '../ui/skeleton';
import { CustomersTable } from './customers-table';
import { classifyCustomer, ClassifyCustomerOutput } from '@/ai/flows/classify-customers';
import { updateCustomer } from '@/services/customers';

type ClassificationResult = ClassifyCustomerOutput & { customerId: string, customerName: string };

export function CustomerGroupsTab({ customers, isLoading: isLoadingCustomers, setCustomers }: { customers: Customer[], isLoading: boolean, setCustomers: React.Dispatch<React.SetStateAction<Customer[]>> }) {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationResults, setClassificationResults] = useState<ClassificationResult[] | null>(null);

  const canEdit = user?.permissions.customers.edit;

  const loadGroups = useCallback(async () => {
    setIsLoadingGroups(true);
    const fetchedData = await getCustomerGroups();
    setGroups(fetchedData);
    setIsLoadingGroups(false);
  }, []);

  useState(() => {
    loadGroups();
  });
  
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
    loadGroups();
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
    loadGroups();
  };

  const handleDeleteGroup = async (groupId: string) => {
    await deleteCustomerGroup(groupId);
    toast({ title: 'Customer Group Deleted', variant: 'destructive' });
    loadGroups();
  };
  
  const openEditDialog = (group: CustomerGroup) => {
    setEditingGroup(group);
    setIsEditOpen(true);
  }
  
  const handleRunClassification = async () => {
    if (customers.length === 0) {
      toast({ title: "No customers to classify." });
      return;
    }
    setIsClassifying(true);
    setClassificationResults(null);
    try {
      const results: ClassificationResult[] = await Promise.all(
        customers.map(async (customer) => {
          const purchaseHistory = (customer.orders || []).flatMap(order => 
            order.items.map(item => ({
              productId: item.sku,
              quantity: item.quantity,
              price: item.price,
              category: item.category || 'Unknown',
              timestamp: order.date
            }))
          );
          
          const result = await classifyCustomer({ customerId: customer.id, purchaseHistory });
          return { ...result, customerId: customer.id, customerName: customer.name };
        })
      );
      setClassificationResults(results.filter(r => r.customerGroup !== 'default'));
    } catch(e) {
      console.error(e);
      toast({ variant: 'destructive', title: "Classification Failed", description: "The AI model might be offline. Please try again later." });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleApplySuggestion = async (customerId: string, newGroup: string) => {
    await updateCustomer(customerId, { customerGroup: newGroup });
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, customerGroup: newGroup } : c));
    setClassificationResults(prev => prev ? prev.filter(r => r.customerId !== customerId) : null);
    toast({ title: "Customer Group Updated" });
  };
  
  if (!user) {
      return <div>Loading...</div>;
  }
  
  const isLoading = isLoadingGroups || isLoadingCustomers;

  if (selectedGroup) {
      const filteredCustomers = customers.filter(c => c.customerGroup === selectedGroup.name);
      return (
          <div>
              <div className="flex items-center gap-4 mb-4">
                  <Button variant="outline" size="icon" onClick={() => setSelectedGroup(null)}>
                      <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-2xl font-bold tracking-tight">Customers in "{selectedGroup.name}"</h2>
              </div>
              <CustomersTable 
                data={filteredCustomers} 
                setData={setCustomers} 
                isLoading={isLoading} 
                columnFilters={[{ id: 'customerGroup', value: [selectedGroup.name] }]}
                setColumnFilters={() => {}}
              />
          </div>
      )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Customer Groups</h2>
            <p className="text-muted-foreground">Organize your customers into groups for targeted marketing and pricing.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={handleRunClassification} disabled={isClassifying}>
              {isClassifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
              AI Suggestions
          </Button>
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
      </div>
      
       {classificationResults && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
                <CardTitle className="text-blue-800">AI Classification Suggestions</CardTitle>
                <CardDescription className="text-blue-700">The AI has analyzed customer purchase history and suggests the following group changes.</CardDescription>
            </CardHeader>
            <CardContent>
                {classificationResults.length > 0 ? (
                     <div className="space-y-3">
                        {classificationResults.map(result => (
                            <div key={result.customerId} className="flex items-center justify-between p-3 border bg-white rounded-md">
                                <div>
                                    <p className="font-medium">{result.customerName}</p>
                                    <p className="text-sm text-muted-foreground">Reason: {result.reason}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-sm">Move to <span className="font-semibold">{result.customerGroup}</span></span>
                                     <Button size="sm" onClick={() => handleApplySuggestion(result.customerId, result.customerGroup)}>Apply</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">No specific group suggestions from the AI at this time.</p>
                )}
            </CardContent>
        </Card>
      )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
                [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32" />)
            ) : (
                groups.map(group => (
                    <Card key={group.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => setSelectedGroup(group)}>
                        <div className="flex flex-col h-full">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                {canEdit && (
                                    <AlertDialog>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(group); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => {e.preventDefault(); e.stopPropagation();}}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
                        </div>
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

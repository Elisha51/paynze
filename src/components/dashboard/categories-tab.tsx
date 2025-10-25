
'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Category } from '@/lib/types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/services/categories';
import { DataTable } from '@/components/dashboard/data-table';
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
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';


const getColumns = (
    openEditDialog: (category: Category) => void,
    handleDelete: (categoryId: string) => void,
): ColumnDef<Category>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
        const category = row.original;
      return (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openEditDialog(category)}>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(category.id)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];


export function CategoriesTab() {
  const [data, setData] = React.useState<Category[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState<Omit<Category, 'id'>>({ name: '', description: ''});
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    const fetchedData = await getCategories();
    setData(fetchedData);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCategory = async () => {
    if (!newCategory.name) {
        toast({ variant: 'destructive', title: 'Name is required' });
        return;
    }
    await addCategory(newCategory);
    toast({ title: 'Category added' });
    setIsAddOpen(false);
    setNewCategory({ name: '', description: '' });
    loadData();
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    await updateCategory(editingCategory);
    toast({ title: 'Category updated' });
    setIsEditOpen(false);
    setEditingCategory(null);
    loadData();
  }

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    toast({ title: 'Category deleted' });
    loadData();
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditOpen(true);
  }

  const columns = React.useMemo(() => getColumns(openEditDialog, handleDeleteCategory), [loadData]);

  return (
    <>
      <Card>
          <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Create and manage reusable configurations for faster product listing.</CardDescription>
              </div>
               <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name</Label>
                            <Input id="name" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" value={newCategory.description} onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleAddCategory}>Add Category</Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable
                columns={columns}
                data={data}
            />
          </CardContent>
      </Card>
      
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
             {editingCategory && (
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" value={editingCategory.description} onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value || ''})} />
                    </div>
                </div>
             )}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleUpdateCategory}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}

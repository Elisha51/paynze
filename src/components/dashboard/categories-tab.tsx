

'use client';

import { PlusCircle, MoreHorizontal, Edit, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import type { Category } from '@/lib/types';
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/services/categories';
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
 import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"

export function CategoriesTab() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState<Omit<Category, 'id'>>({ name: '', description: ''});
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    const fetchedData = await getCategories();
    setCategories(fetchedData);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
  const groupedCategories = React.useMemo(() => {
    return categories.reduce((acc, category) => {
        const mainCategory = category.description || 'Uncategorized';
        if (!acc[mainCategory]) {
            acc[mainCategory] = [];
        }
        acc[mainCategory].push(category);
        return acc;
    }, {} as Record<string, Category[]>);
  }, [categories]);

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.description) {
        toast({ variant: 'destructive', title: 'Main category and sub-category name are required.' });
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
    toast({ title: 'Sub-category deleted' });
    loadData();
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setIsEditOpen(true);
  }

  return (
    <>
      <Card>
          <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Group products into categories and sub-categories.</CardDescription>
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
                            <Label htmlFor="description">Main Category</Label>
                            <Input id="description" value={newCategory.description || ''} onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} placeholder="e.g., Apparel" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Sub-category Name</Label>
                            <Input id="name" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} placeholder="e.g., T-Shirts" />
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
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedCategories).map(([mainCategory, subCategories]) => (
                <AccordionItem value={mainCategory} key={mainCategory}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                       <h3 className="font-semibold text-md">{mainCategory}</h3>
                       <span className="text-sm text-muted-foreground">{subCategories.length} sub-categories</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-4">
                      {subCategories.map(subCategory => (
                        <div key={subCategory.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                           <span>{subCategory.name}</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => openEditDialog(subCategory)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will delete the "{subCategory.name}" sub-category.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCategory(subCategory.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
                        <Label htmlFor="description-edit">Main Category</Label>
                        <Input id="description-edit" value={editingCategory.description} onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value || ''})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name-edit">Sub-category Name</Label>
                        <Input id="name-edit" value={editingCategory.name} onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})} />
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

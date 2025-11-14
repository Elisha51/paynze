
'use client';

import { PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
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
  DropdownMenuTrigger,
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
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function CategoriesTab() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'add' | 'edit'>('add');
  const [currentCategory, setCurrentCategory] = React.useState<Partial<Category>>({ name: '', parentId: null });
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    const fetchedData = await getCategories();
    setCategories(fetchedData);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  
  const { mainCategories, subCategoriesByParent } = React.useMemo(() => {
    const main: Category[] = [];
    const sub: Record<string, Category[]> = {};

    for (const category of categories) {
        if (category.parentId) {
            if (!sub[category.parentId]) {
                sub[category.parentId] = [];
            }
            sub[category.parentId].push(category);
        } else {
            main.push(category);
        }
    }
    return { mainCategories: main, subCategoriesByParent: sub };
  }, [categories]);

  const openDialog = (mode: 'add' | 'edit', category?: Partial<Category>) => {
    setDialogMode(mode);
    setCurrentCategory(category || { name: '', parentId: null });
    setIsDialogOpen(true);
  }

  const handleSave = async () => {
    if (!currentCategory.name) {
        toast({ variant: 'destructive', title: 'Category name is required.' });
        return;
    }
    
    if (dialogMode === 'add') {
        await addCategory({ name: currentCategory.name, parentId: currentCategory.parentId || null });
        toast({ title: 'Category added' });
    } else if (currentCategory.id) {
        await updateCategory(currentCategory as Category);
        toast({ title: 'Category updated' });
    }
    
    setIsDialogOpen(false);
    loadData();
  }

  const handleDeleteCategory = async (id: string) => {
    // Check if it's a parent category with children
    if (subCategoriesByParent[id] && subCategoriesByParent[id].length > 0) {
        toast({
            variant: 'destructive',
            title: 'Cannot Delete Parent Category',
            description: 'Please delete or re-assign its sub-categories first.'
        });
        return;
    }
    await deleteCategory(id);
    toast({ title: 'Category deleted' });
    loadData();
  }

  return (
    <>
      <Card>
          <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Group products into categories and sub-categories.</CardDescription>
              </div>
               <Button onClick={() => openDialog('add')}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {mainCategories.map(mainCategory => (
                <AccordionItem value={mainCategory.id} key={mainCategory.id}>
                    <div className="flex justify-between items-center w-full hover:bg-muted/50 rounded-md">
                        <AccordionTrigger className="flex-1 py-4 px-4 hover:no-underline">
                            <div className="text-left">
                                <h3 className="font-semibold text-md">{mainCategory.name}</h3>
                                <span className="text-sm text-muted-foreground">{(subCategoriesByParent[mainCategory.id] || []).length} sub-categories</span>
                            </div>
                        </AccordionTrigger>
                        <div className="pr-4">
                             <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => openDialog('edit', mainCategory)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete "{mainCategory.name}"?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete the category. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCategory(mainCategory.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                  <AccordionContent>
                    <div className="space-y-2 pl-4">
                      {(subCategoriesByParent[mainCategory.id] || []).map(subCategory => (
                        <div key={subCategory.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                           <span>{subCategory.name}</span>
                           <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => openDialog('edit', subCategory)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete "{subCategory.name}"?</AlertDialogTitle>
                                        <AlertDialogDescription>This will delete the sub-category.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteCategory(subCategory.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      ))}
                      <Button variant="link" size="sm" className="p-1 h-auto" onClick={() => openDialog('add', { parentId: mainCategory.id })}>
                          <PlusCircle className="h-4 w-4 mr-1"/> Add sub-category
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
      </Card>
      
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>{dialogMode === 'add' ? 'Add' : 'Edit'} Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="parentId">Parent Category (Optional)</Label>
                    <Select value={currentCategory.parentId || 'none'} onValueChange={(v) => setCurrentCategory({...currentCategory, parentId: v === 'none' ? null : v })}>
                        <SelectTrigger><SelectValue placeholder="Select parent..."/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None (This is a main category)</SelectItem>
                            {mainCategories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id} disabled={cat.id === currentCategory.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input id="name" value={currentCategory.name || ''} onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} placeholder={currentCategory.parentId ? "e.g., T-Shirts" : "e.g., Apparel"}/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSave}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}

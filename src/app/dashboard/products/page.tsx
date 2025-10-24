
'use client';

import { PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductsTable } from '@/components/dashboard/products-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useSearch } from '@/context/search-context';

export default function ProductsPage() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const { searchQuery, setSearchQuery } = useSearch();


  return (
    <>
      <Tabs defaultValue="all">
        <div className="space-y-2 mb-4">
          <h2 className="text-3xl font-bold tracking-tight font-headline">Products</h2>
        </div>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-2">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Search products..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details for your new product. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" value={productName} onChange={(e) => setProductName(e.target.value)} className="col-span-3" placeholder="e.g. Kitenge Fabric" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" placeholder="e.g. Fabrics"/>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="A brief description of the product."/>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <TabsContent value="all">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                Manage your products and view their sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="active">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Active Products</CardTitle>
              <CardDescription>
                View all products that are currently visible to customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable filter={{ column: 'status', value: 'active' }}/>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="draft">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Draft Products</CardTitle>
              <CardDescription>
                View all products that are not yet published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable filter={{ column: 'status', value: 'draft' }}/>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="archived">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Archived Products</CardTitle>
              <CardDescription>
                View all products that have been archived.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductsTable filter={{ column: 'status', value: 'archived' }}/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

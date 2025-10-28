

'use client';
import * as React from 'react';
import Image from 'next/image';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, Package, PlusCircle, PackageCheck, FileArchive, File as FileIcon } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product } from '@/lib/types';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';

const productStatuses = [
    { value: 'published', label: 'Published', icon: PackageCheck },
    { value: 'draft', label: 'Draft', icon: FileIcon },
    { value: 'archived', label: 'Archived', icon: FileArchive },
];
const productTypes = [
    { value: 'Physical', label: 'Physical' },
    { value: 'Digital', label: 'Digital' },
    { value: 'Service', label: 'Service' },
];

const getColumns = (
  archiveProduct: (sku: string) => void,
  unarchiveProduct: (sku: string) => void
): ColumnDef<Product>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'images',
    header: () => <div className="hidden sm:table-cell">Image</div>,
    cell: ({ row }) => {
      const product = row.original;
      const imageUrl = (product.images[0] as { url: string })?.url;
      
      return (
        <div className="w-[64px] h-[64px] hidden sm:table-cell">
          <Image
            alt={product.name}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={imageUrl || `https://picsum.photos/seed/${product.sku}/64/64`}
            width="64"
            data-ai-hint="product image"
          />
        </div>
      );
    },
    enableSorting: false,
  },
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
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col">
          <Link href={`/dashboard/products/${product.sku}`} className="font-medium hover:underline">{product.name}</Link>
          <span className="text-xs text-muted-foreground">{product.sku}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const variant = status === 'draft' ? 'secondary' : status === 'archived' ? 'outline' : 'default';
      const capitalizedVisibility = status.charAt(0).toUpperCase() + status.slice(1);
      return <div className="whitespace-nowrap"><Badge variant={variant}>{capitalizedVisibility}</Badge></div>;
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
    {
    accessorKey: 'productType',
    header: 'Type',
    cell: ({ row }) => {
        return <Badge variant="outline">{row.getValue('productType')}</Badge>
    },
    filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'retailPrice',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
          </div>
        );
      },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('retailPrice'));
      const currency = row.original.currency;
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => {
        return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                >
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        if (product.inventoryTracking === "Don't Track") {
            return <div className="text-right text-muted-foreground">--</div>;
        }
        // Sum stock from all variants and locations
        const totalStock = product.variants.reduce((sum, v) => 
            sum + (v.stockByLocation?.reduce((locSum, loc) => locSum + loc.stock.available, 0) || 0), 0);
        return <div className="text-right">{totalStock}</div>;
      }
  },
  {
    accessorKey: 'category',
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <div className="text-right sticky right-0">Actions</div>,
    cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="relative bg-background text-right sticky right-0">
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                   <DropdownMenuItem asChild>
                    <Link href={`/dashboard/products/${product.sku}`}>View</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/products/${product.sku}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {product.status !== 'archived' ? (
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={e => e.preventDefault()}>
                        Archive
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                  ) : (
                    <DropdownMenuItem onClick={() => product.sku && unarchiveProduct(product.sku)}>
                        Unarchive
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will archive the product &quot;{product.name}&quot;. It will no longer be visible to customers but can be restored later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={() => product.sku && archiveProduct(product.sku)}
                  >
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
    },
  },
];

type ProductsTableProps = {
  data: Product[];
  setData: React.Dispatch<React.SetStateAction<Product[]>>;
  isLoading: boolean;
};

export function ProductsTable({ data, setData, isLoading }: ProductsTableProps) {
  const { toast } = useToast();
  
  const archiveProduct = async (sku: string) => {
    // Optimistically update the UI
    setData(currentData =>
      currentData.map(product =>
        product.sku === sku ? { ...product, status: 'archived' } : product
      )
    );

    try {
        // In a real app, this would be a service call
        toast({
            title: "Product Archived",
            description: "The product has been moved to the archive.",
        });
    } catch (error) {
        setData(currentData =>
            currentData.map(product =>
                product.sku === sku ? { ...product, status: 'published' } : product
            )
        );
        toast({
            variant: "destructive",
            title: "Archive Failed",
            description: "Could not archive the product. Please try again.",
        });
    }
  };

  const unarchiveProduct = (sku: string) => {
    setData(currentData =>
      currentData.map(product =>
        product.sku === sku ? { ...product, status: 'draft' } : product
      )
    );
     toast({
        title: "Product Unarchived",
        description: "The product has been restored to 'Draft' status.",
    });
  }

  const columns = React.useMemo(() => getColumns(archiveProduct, unarchiveProduct), [setData]);

  return (
    <DataTable
        columns={columns}
        data={data}
        filters={[
          { columnId: 'status', title: 'Status', options: productStatuses },
          { columnId: 'productType', title: 'Type', options: productTypes }
        ]}
        emptyState={{
            icon: Package,
            title: "No Products Found",
            description: "No products match the current filters. Try adjusting your search.",
            cta: (
                <Button asChild>
                    <Link href="/dashboard/products/add">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Product
                    </Link>
                </Button>
            )
        }}
    />
  );
}

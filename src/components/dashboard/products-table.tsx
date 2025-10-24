
'use client';
import * as React from 'react';
import Image from 'next/image';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product } from '@/lib/types';
import { DataTable } from './data-table';
import { useToast } from '@/hooks/use-toast';

const getColumns = (
  archiveProduct: (sku: string) => void,
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
    header: () => <div className="hidden">Image</div>,
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
    accessorKey: 'visibility',
    header: 'Status',
    cell: ({ row }) => {
      const visibility = row.getValue('visibility') as string;
      const variant = visibility === 'draft' ? 'secondary' : visibility === 'archived' ? 'outline' : 'default';
      const capitalizedVisibility = visibility.charAt(0).toUpperCase() + visibility.slice(1);
      return <Badge variant={variant}>{capitalizedVisibility}</Badge>;
    }
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
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'stockQuantity',
    header: 'Stock',
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
    cell: ({ row }) => {
        const product = row.original;
        return (
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
                    <Link href={`/dashboard/products/${product.sku}`}>Edit</Link>
                  </DropdownMenuItem>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
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
                    onClick={() => archiveProduct(product.sku)}
                  >
                    Archive
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        );
    },
  },
];

type ProductsTableProps = {
  data: Product[];
  setData: React.Dispatch<React.SetStateAction<Product[]>>;
  filter?: {
    column: string;
    value: string;
  };
  cardTitle: string;
  cardDescription: string;
};

export function ProductsTable({ data, setData, filter, cardTitle, cardDescription }: ProductsTableProps) {
  const { toast } = useToast();
  
  const archiveProduct = (sku: string) => {
    setData(currentData =>
      currentData.map(product =>
        product.sku === sku ? { ...product, visibility: 'archived' } : product
      )
    );
    toast({
        title: "Product Archived",
        description: "The product has been moved to the archive.",
    });
  };

  const columns = React.useMemo(() => getColumns(archiveProduct), [archiveProduct]);

  return (
    <DataTable
        columns={columns}
        data={data}
        filter={filter}
        cardTitle={cardTitle}
        cardDescription={cardDescription}
    />
  );
}


'use client';
import * as React from 'react';
import Image from 'next/image';
import {
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';

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
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Product } from '@/lib/types';
import { getProducts } from '@/services/products';
import { DataTable } from './data-table';


const columns: ColumnDef<Product>[] = [
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
      const imageId = product.images[0] || 'product-placeholder';
      const image = PlaceHolderImages.find((p) => p.id === imageId);
      return (
        <div className="w-[64px] h-[64px] hidden sm:table-cell">
          <Image
            alt={product.name}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={image?.imageUrl || `https://picsum.photos/seed/${product.sku}/64/64`}
            width="64"
            data-ai-hint={image?.imageHint}
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
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">{product.sku}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'visibility',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('visibility') === 'draft' ? 'secondary' : 'default'}>
        {row.getValue('visibility')}
      </Badge>
    ),
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
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

type ProductsTableProps = {
  filter?: {
    column: string;
    value: string;
  };
  cardTitle: string;
  cardDescription: string;
};

export function ProductsTable({ filter, cardTitle, cardDescription }: ProductsTableProps) {
  const [data, setData] = React.useState<Product[]>([]);

  React.useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await getProducts();
      setData(fetchedProducts);
    }
    loadProducts();
  }, []);
  

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

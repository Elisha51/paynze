
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { getDiscounts } from '@/services/marketing';
import type { Discount } from '@/lib/types';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const discountColumns: ColumnDef<Discount>[] = [
    {
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'type',
        header: 'Type',
    },
    {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => {
            const discount = row.original;
            if (discount.type === 'Percentage') {
                return `${discount.value}%`;
            }
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(discount.value);
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status;
            return <Badge variant={status === 'Active' ? 'default' : 'outline'}>{status}</Badge>
        }
    },
    {
        accessorKey: 'redemptions',
        header: 'Redemptions',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const discount = row.original;
            return (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    }
];

export function DiscountsTab() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getDiscounts();
      setDiscounts(data);
    }
    loadData();
  }, []);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Discounts</CardTitle>
          <CardDescription>
            Manage and create discount codes for your store.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/marketing/discounts/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Discount
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable columns={discountColumns} data={discounts} />
      </CardContent>
    </Card>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { getDiscounts, deleteDiscount } from '@/services/marketing';
import type { Discount } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Edit, Trash2, Check, ChevronsUpDown, Ban } from 'lucide-react';
import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';

const discountStatuses = [
    { value: 'Active', label: 'Active' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Scheduled', label: 'Scheduled' },
];

const discountTypes = [
    { value: 'Percentage', label: 'Percentage' },
    { value: 'Fixed Amount', label: 'Fixed Amount' },
    { value: 'Buy X Get Y', label: 'Buy X Get Y' },
];

const getDiscountColumns = (onDelete: (code: string) => void): ColumnDef<Discount>[] => [
     {
        id: 'select',
        header: ({ table }) => (
        <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'type',
        header: 'Type',
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
    },
    {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => {
            const discount = row.original;
            if (discount.type === 'Percentage') {
                return `${discount.value}%`;
            }
             if (discount.type === 'Fixed Amount') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(discount.value);
            }
             if (discount.type === 'Buy X Get Y') {
                return `Buy ${discount.bogoDetails?.buyQuantity || 1}, Get ${discount.bogoDetails?.getQuantity || 1}`;
            }
            return 'N/A';
        }
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const discount = row.original;
            let status: Discount['status'] = discount.status;

            if (discount.status !== 'Expired') {
                const now = new Date();
                if (discount.startDate && new Date(discount.startDate) > now) {
                    status = 'Scheduled';
                } else if (discount.endDate && new Date(discount.endDate) < now) {
                    status = 'Expired';
                } else {
                    status = 'Active';
                }
            }
            
            const variant = status === 'Active' ? 'default' : status === 'Expired' ? 'destructive' : 'secondary';
            return <Badge variant={variant}>{status}</Badge>
        },
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
    },
    {
        accessorKey: 'customerGroup',
        header: 'Target Group',
        cell: ({ row }) => {
            const customerGroup = row.getValue('customerGroup') as string;
            return <Badge variant="outline">{customerGroup}</Badge>
        },
        filterFn: (row, id, value) => (value as string[]).includes(row.getValue(id)),
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
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/marketing/discounts/${discount.code}/edit`}><Edit className="mr-2 h-4 w-4"/> Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Ban className="mr-2 h-4 w-4 text-orange-500" /> Discontinue
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={e => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4"/> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the discount code "{discount.code}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(discount.code)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )
        }
    }
];

export function DiscountsTab() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function loadData() {
      const data = await getDiscounts();
      setDiscounts(data);
    }
    loadData();
  }, []);
  
  const handleDelete = async (code: string) => {
    await deleteDiscount(code);
    setDiscounts(prev => prev.filter(d => d.code !== code));
    toast({ variant: 'destructive', title: "Discount Deleted" });
  }

  const columns = getDiscountColumns(handleDelete);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Discounts</CardTitle>
          <CardDescription>
            Manage and create discount codes for your store.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable 
            columns={columns} 
            data={discounts} 
            isLoading={false}
            filters={[
                { columnId: 'status', title: 'Status', options: discountStatuses },
                { columnId: 'type', title: 'Type', options: discountTypes }
            ]}
        />
      </CardContent>
    </Card>
  );
}

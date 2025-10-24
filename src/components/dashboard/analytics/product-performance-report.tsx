

'use client';
import { useState, useEffect, useMemo } from 'react';
import { getProducts } from '@/services/products';
import type { Product, ProductVariant } from '@/lib/types';
import { DataTable } from '@/components/dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import Link from 'next/link';

type ReportRow = {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  unitsSold: number;
  netSales: number;
  currency: string;
};

const getColumns = (currency: string): ColumnDef<ReportRow>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product/Variant
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
       <div className="flex flex-col">
          <Link href={`/dashboard/products/${row.original.sku}`} className="font-medium hover:underline">{row.original.name}</Link>
          <span className="text-xs text-muted-foreground">{row.original.sku}</span>
        </div>
    )
  },
  {
    accessorKey: 'unitsSold',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Units Sold
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue('unitsSold')}</div>,
  },
  {
    accessorKey: 'netSales',
    header: ({ column }) => (
      <div className="text-right">
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            Net Sales
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('netSales'));
      const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];

export function ProductPerformanceReport() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts() {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    }
    loadProducts();
  }, []);

  const reportData = useMemo(() => {
    const data: ReportRow[] = [];
    products.forEach(product => {
      product.variants.forEach(variant => {
        const salesAdjustments = (variant.stockAdjustments || []).filter(adj => adj.type === 'Sale');
        if (salesAdjustments.length > 0) {
          const unitsSold = salesAdjustments.reduce((sum, adj) => sum + Math.abs(adj.quantity), 0);
          const price = variant.price ?? product.retailPrice;
          const netSales = unitsSold * price;

          data.push({
            productId: product.sku || product.name,
            variantId: variant.id,
            name: product.hasVariants ? `${product.name} - ${Object.values(variant.optionValues).join(' / ')}` : product.name,
            sku: variant.sku || product.sku || 'N/A',
            unitsSold,
            netSales,
            currency: product.currency,
          });
        }
      });
    });
    return data;
  }, [products]);

  const currency = products[0]?.currency || 'UGX';
  const columns = useMemo(() => getColumns(currency), [currency]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>
          Analyze sales performance by product and variant to identify your best-sellers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={reportData} />
      </CardContent>
    </Card>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Package, Users, ShoppingCart } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '../ui/button';
import { getProducts } from '@/services/products';
import { getCustomers } from '@/services/customers';
import { getOrders } from '@/services/orders';
import type { Product, Customer, Order } from '@/lib/types';
import { useRouter } from 'next/navigation';

type SearchResult = {
  type: 'product' | 'customer' | 'order';
  id: string;
  label: string;
  description: string;
  href: string;
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const handleSelect = (href: string) => {
    runCommand(() => router.push(href));
  }

  const loadData = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const [products, customers, orders] = await Promise.all([
      getProducts(),
      getCustomers(),
      getOrders(),
    ]);

    const productResults: SearchResult[] = products
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .map(p => ({
        type: 'product',
        id: p.sku || p.name,
        label: p.name,
        description: `Product - SKU: ${p.sku}`,
        href: `/dashboard/products/${p.sku}`
      }));
      
    const customerResults: SearchResult[] = customers
      .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()))
      .map(c => ({
        type: 'customer',
        id: c.id,
        label: c.name,
        description: `Customer - ${c.email}`,
        href: `/dashboard/customers/${c.id}`
      }));

    const orderResults: SearchResult[] = orders
      .filter(o => o.id.toLowerCase().includes(query.toLowerCase()) || o.customerName.toLowerCase().includes(query.toLowerCase()))
      .map(o => ({
        type: 'order',
        id: o.id,
        label: `Order #${o.id}`,
        description: `Order - ${o.customerName}`,
        href: `/dashboard/orders/${o.id}`
      }));

    setResults([...productResults, ...customerResults, ...orderResults]);
  };
  
  const iconMap = {
    product: <Package className="mr-2 h-4 w-4" />,
    customer: <Users className="mr-2 h-4 w-4" />,
    order: <ShoppingCart className="mr-2 h-4 w-4" />,
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search for products, customers, orders..."
          onValueChange={loadData}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {(results.length > 0) && (
            <CommandGroup heading="Results">
              {results.map(result => (
                <CommandItem key={result.id} onSelect={() => handleSelect(result.href)}>
                  {iconMap[result.type]}
                  <span>{result.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
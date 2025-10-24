'use client';
import { MoreHorizontal, MessageCircle, Phone, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEffect, useState } from 'react';
import type { Customer } from '@/lib/types';
import { getCustomers } from '@/services/customers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      const fetchedCustomers = await getCustomers();
      setCustomers(fetchedCustomers);
    }
    loadCustomers();
  }, []);

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead className="text-right">Total Spend</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{customer.email}</span>
                    <span className="text-muted-foreground">{customer.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.customerGroup}</Badge>
                </TableCell>
                <TableCell>{customer.lastOrder}</TableCell>
                <TableCell className="text-right">{customer.totalSpend}</TableCell>
                <TableCell>
                    <div className="flex items-center justify-end gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Send via WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Phone className="mr-2 h-4 w-4" />
                                Send via SMS
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Info className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden grid grid-cols-1 gap-4">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {customer.name}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send via WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Send via SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <CardDescription>
                <Badge variant="outline">{customer.customerGroup}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div><strong>Contact:</strong> {customer.email}, {customer.phone}</div>
                <div><strong>Last Order:</strong> {customer.lastOrder}</div>
                <div><strong>Total Spend:</strong> {customer.totalSpend}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

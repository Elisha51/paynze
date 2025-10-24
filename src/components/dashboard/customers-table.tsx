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
import { customers } from '@/lib/data';

export function CustomersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden sm:table-cell">Contact</TableHead>
          <TableHead>Group</TableHead>
          <TableHead className="hidden md:table-cell">Last Order</TableHead>
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
            <TableCell className="hidden sm:table-cell">
              <div className="flex flex-col">
                <span>{customer.email}</span>
                <span className="text-muted-foreground">{customer.phone}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{customer.customerGroup}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{customer.lastOrder}</TableCell>
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
  );
}

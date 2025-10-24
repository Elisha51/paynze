'use client';
import { useState } from 'react';
import { MoreHorizontal, Wand2, MessageCircle, Phone, Loader2, Info } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
  
import { customers, Customer } from '@/lib/data';
import { classifyCustomer, ClassifyCustomerOutput } from '@/ai/flows/classify-customers';
import { useToast } from '@/hooks/use-toast';

export function CustomersTable() {
    const [classifyingId, setClassifyingId] = useState<string | null>(null);
    const [classificationResult, setClassificationResult] = useState<ClassifyCustomerOutput | null>(null);
    const { toast } = useToast();

    const handleClassify = async (customer: Customer) => {
        setClassifyingId(customer.id);
        setClassificationResult(null);
        try {
            const result = await classifyCustomer({
                customerId: customer.id,
                purchaseHistory: customer.purchaseHistory
            });
            setClassificationResult(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Classification Failed",
                description: "Could not classify customer. Please try again.",
            });
        } finally {
            setClassifyingId(null);
        }
    };


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
                    <Popover onOpenChange={(open) => !open && setClassificationResult(null)}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClassify(customer)}
                                disabled={classifyingId === customer.id}
                            >
                                {classifyingId === customer.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Wand2 className="mr-2 h-4 w-4" />
                                )}
                                Classify
                            </Button>
                        </PopoverTrigger>
                        {classificationResult && (
                             <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Customer Classification</h4>
                                    <p className="text-sm text-muted-foreground">
                                    AI-powered analysis of purchase history.
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                    <span>Group</span>
                                    <span className="col-span-2 font-bold">{classificationResult.customerGroup}</span>
                                    </div>
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <span>Reason</span>
                                        <p className="col-span-2 text-sm">{classificationResult.reason}</p>
                                    </div>
                                </div>
                                </div>
                            </PopoverContent>
                        )}
                    </Popover>
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

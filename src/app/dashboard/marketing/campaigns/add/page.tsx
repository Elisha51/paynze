

'use client';
import { ArrowLeft, Save, Sparkles, Calendar as CalendarIcon, Package, X, Check, ChevronsUpDown, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { getProducts } from '@/services/products';
import type { Product, Campaign } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function AddCampaignPage() {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [isEndDate, setIsEndDate] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const canCreate = user?.permissions.marketing?.create;

    useEffect(() => {
        async function loadProducts() {
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        }
        loadProducts();
    }, []);

    const handleProductSelect = (productSku: string) => {
        setSelectedProducts(prev => {
            const newSelection = prev.includes(productSku)
                ? prev.filter(sku => sku !== productSku)
                : [...prev, productSku];
            return newSelection;
        });
    }

    const handleBack = () => {
        router.back();
    }

    const handleSave = () => {
        // Mock save logic
        toast({
            title: "Campaign Saved",
            description: "Your new campaign has been created successfully."
        });
        router.push('/dashboard/marketing?tab=campaigns');
    };
    
    if (!canCreate) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You do not have permission to create new campaigns.</p>
                     <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </CardContent>
            </Card>
        );
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Campaign</h1>
          <p className="text-muted-foreground text-sm">Fill in the details to launch a new marketing campaign.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Campaign
            </Button>
        </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input id="name" placeholder="e.g., Summer Sale" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="description">Description</Label>
                    <Button variant="ghost" size="sm">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate with AI
                    </Button>
                </div>
                <Textarea id="description" placeholder="A brief description of the campaign's goals." />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Audience & Channel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="channel">Channel</Label>
                        <Select>
                            <SelectTrigger id="channel">
                                <SelectValue placeholder="Select a channel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                                <SelectItem value="push">Push Notification</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="audience">Audience</Label>
                        <Select>
                            <SelectTrigger id="audience">
                                <SelectValue placeholder="Select an audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Customers</SelectItem>
                                <SelectItem value="new">New Customers</SelectItem>
                                <SelectItem value="wholesalers">Wholesalers</SelectItem>
                                <SelectItem value="abandoned">Abandoned Carts (Last 7 days)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
            </CardContent>
          </Card>
           <Card>
                <CardHeader>
                    <CardTitle>Target Products</CardTitle>
                    <CardDescription>Optionally, select specific products for this campaign. Leave blank to apply to all.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Products</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                >
                                    <span className="truncate">
                                        {selectedProducts.length > 0 
                                            ? `${selectedProducts.length} selected`
                                            : "Select products..."
                                        }
                                    </span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search products..." />
                                    <CommandEmpty>No products found.</CommandEmpty>
                                    <CommandGroup>
                                        {products.map((product) => (
                                        <CommandItem
                                            key={product.sku}
                                            value={product.name}
                                            onSelect={() => handleProductSelect(product.sku || '')}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedProducts.includes(product.sku || '') ? "opacity-100" : "opacity-0"
                                            )}
                                            />
                                            {product.name}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                         <div className="flex flex-wrap gap-1 pt-2">
                          {selectedProducts.map(sku => {
                            const product = products.find(p => p.sku === sku);
                            return product ? (
                               <Badge key={sku} variant="secondary" className="flex items-center gap-1">
                                {product.name}
                                <button onClick={() => handleProductSelect(sku)} className="rounded-full hover:bg-muted-foreground/20">
                                    <X className="h-3 w-3"/>
                                </button>
                               </Badge>
                            ) : null;
                          })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Schedule</CardTitle>
                    <CardDescription>Set the start and end dates for the campaign.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !startDate && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus/>
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="isEndDate" checked={isEndDate} onChange={(e) => setIsEndDate(e.target.checked)} />
                        <Label htmlFor="isEndDate">Set an end date</Label>
                    </div>
                    {isEndDate && (
                        <div className="space-y-2">
                            <Label>End Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus/>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}

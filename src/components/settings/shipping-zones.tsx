
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ShippingZone, DeliveryMethod } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Globe, Truck, X, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { addShippingZone, updateShippingZone, deleteShippingZone } from '@/services/shipping';
import { getCountryList } from '@/services/countries';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type ShippingZonesProps = {
  zones: ShippingZone[];
  setZones: React.Dispatch<React.SetStateAction<ShippingZone[]>>;
};

const emptyZone: Omit<ShippingZone, 'id'> = {
  name: '',
  countries: [],
  deliveryMethods: [],
};

const emptyMethod: Omit<DeliveryMethod, 'id'> = {
  name: '',
  description: '',
  type: 'Fixed',
  price: 0,
};

function ZoneForm({ 
    zone, 
    onZoneChange,
    allCountries 
}: { 
    zone: Partial<ShippingZone>, 
    onZoneChange: (updates: Partial<ShippingZone>) => void,
    allCountries: { name: string }[],
}) {
    
    const handleCountrySelect = (countryName: string) => {
        const currentCountries = zone.countries || [];
        const newCountries = currentCountries.includes(countryName)
            ? currentCountries.filter(c => c !== countryName)
            : [...currentCountries, countryName];
        onZoneChange({ countries: newCountries });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Zone Name</Label>
                <Input id="name" placeholder="e.g., Domestic, East Africa" value={zone.name || ''} onChange={(e) => onZoneChange({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
                <Label>Countries</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-auto min-h-10"
                        >
                            <div className="flex flex-wrap gap-1">
                                {(zone.countries || []).length > 0 
                                    ? (zone.countries || []).map(country => <Badge key={country} variant="secondary">{country}</Badge>)
                                    : "Select countries..."
                                }
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search countries..." />
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                                {allCountries.map((country) => (
                                <CommandItem
                                    key={country.name}
                                    value={country.name}
                                    onSelect={() => handleCountrySelect(country.name)}
                                >
                                    <Check className={cn("mr-2 h-4 w-4", (zone.countries || []).includes(country.name) ? "opacity-100" : "opacity-0")} />
                                    {country.name}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

function MethodForm({ method, onMethodChange }: { method: Partial<DeliveryMethod>, onMethodChange: (updates: Partial<DeliveryMethod>) => void }) {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="method-name">Method Name</Label>
                <Input id="method-name" placeholder="e.g., Standard Shipping" value={method.name || ''} onChange={(e) => onMethodChange({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="method-description">Description (Optional)</Label>
                <Input id="method-description" placeholder="e.g., 3-5 business days" value={method.description || ''} onChange={(e) => onMethodChange({ description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="method-type">Pricing Type</Label>
                    <Select value={method.type || 'Fixed'} onValueChange={(v: DeliveryMethod['type']) => onMethodChange({ type: v })}>
                        <SelectTrigger id="method-type"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Fixed">Fixed Price</SelectItem>
                            <SelectItem value="Percentage">Percentage of Cart</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="method-price">Price / Rate</Label>
                    <Input id="method-price" type="number" value={method.price || 0} onChange={(e) => onMethodChange({ price: Number(e.target.value) })} />
                </div>
            </div>
        </div>
    )
}


export function ShippingZones({ zones, setZones }: ShippingZonesProps) {
  const [dialogState, setDialogState] = useState<{ mode: 'add' | 'edit'; data?: ShippingZone } | null>(null);
  const [methodDialogState, setMethodDialogState] = useState<{ zoneId: string; mode: 'add' | 'edit'; data?: DeliveryMethod } | null>(null);
  const [formData, setFormData] = useState<Partial<ShippingZone>>(emptyZone);
  const [methodFormData, setMethodFormData] = useState<Partial<DeliveryMethod>>(emptyMethod);
  const [countries, setCountries] = useState<{name: string}[]>([]);
  const { toast } = useToast();
  
  useState(() => {
    async function loadCountries() {
        const countryList = await getCountryList();
        setCountries(countryList);
    }
    loadCountries();
  });

  const openZoneDialog = (mode: 'add' | 'edit', zone?: ShippingZone) => {
    setDialogState({ mode, data: zone });
    setFormData(zone || emptyZone);
  };
  
  const openMethodDialog = (zoneId: string, mode: 'add' | 'edit', method?: DeliveryMethod) => {
    setMethodDialogState({ zoneId, mode, data: method });
    setMethodFormData(method || emptyMethod);
  }

  const handleZoneSave = async () => {
    if (!formData.name || !formData.countries?.length) {
      toast({ variant: 'destructive', title: 'Name and at least one country are required.' });
      return;
    }
    if (dialogState?.mode === 'add') {
      const newZone = await addShippingZone(formData as Omit<ShippingZone, 'id'>);
      setZones(prev => [...prev, newZone]);
      toast({ title: 'Shipping Zone Added' });
    } else if (dialogState?.mode === 'edit' && formData.id) {
      const updatedZone = await updateShippingZone(formData as ShippingZone);
      setZones(prev => prev.map(z => z.id === formData.id ? updatedZone : z));
      toast({ title: 'Shipping Zone Updated' });
    }
    setDialogState(null);
  };
  
  const handleMethodSave = async () => {
    if (!methodFormData.name || methodFormData.price === undefined) {
        toast({ variant: 'destructive', title: 'Method name and price are required.' });
        return;
    }
    
    if (!methodDialogState) return;

    const { zoneId, mode } = methodDialogState;
    const zoneToUpdate = zones.find(z => z.id === zoneId);
    if (!zoneToUpdate) return;
    
    let newMethods: DeliveryMethod[];

    if (mode === 'add') {
        const newMethod: DeliveryMethod = { ...emptyMethod, ...methodFormData, id: `method-${Date.now()}` };
        newMethods = [...zoneToUpdate.deliveryMethods, newMethod];
    } else {
        newMethods = zoneToUpdate.deliveryMethods.map(m => m.id === methodFormData.id ? { ...m, ...methodFormData } as DeliveryMethod : m);
    }
    
    const updatedZone = await updateShippingZone({ ...zoneToUpdate, deliveryMethods: newMethods });
    setZones(prev => prev.map(z => z.id === zoneId ? updatedZone : z));
    toast({ title: `Delivery method ${mode === 'add' ? 'added' : 'updated'}.` });
    setMethodDialogState(null);
  }
  
  const handleDeleteZone = async (zoneId: string) => {
    await deleteShippingZone(zoneId);
    setZones(prev => prev.filter(z => z.id !== zoneId));
    toast({ variant: 'destructive', title: 'Zone Deleted' });
  }

  const handleDeleteMethod = async (zoneId: string, methodId: string) => {
    const zoneToUpdate = zones.find(z => z.id === zoneId);
    if (!zoneToUpdate) return;
    
    const newMethods = zoneToUpdate.deliveryMethods.filter(m => m.id !== methodId);
    const updatedZone = await updateShippingZone({ ...zoneToUpdate, deliveryMethods: newMethods });
    setZones(prev => prev.map(z => z.id === zoneId ? updatedZone : z));
    toast({ variant: 'destructive', title: 'Delivery method deleted.' });
  }
  
  const formatPrice = (method: DeliveryMethod) => {
      if (method.type === 'Percentage') {
          return `${method.price}%`;
      }
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(method.price); // Simplified currency
  }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Shipping Zones</CardTitle>
            <CardDescription>
              Group regions to offer different shipping rates.
            </CardDescription>
          </div>
          <Button onClick={() => openZoneDialog('add')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Zone
          </Button>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {zones.map((zone) => (
                <AccordionItem value={zone.id} key={zone.id}>
                    <div className="flex justify-between items-center w-full hover:bg-muted/50 rounded-md">
                        <AccordionTrigger className="flex-1 py-4 px-4 hover:no-underline">
                             <div className="text-left">
                                <p className="font-semibold text-base">{zone.name}</p>
                                <p className="text-sm text-muted-foreground">{zone.countries.join(', ')}</p>
                            </div>
                        </AccordionTrigger>
                         <div className="flex items-center gap-2 text-right pr-4">
                            <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openZoneDialog('edit', zone)}><Edit className="mr-2 h-4 w-4"/> Edit Zone</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                         <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4"/> Delete Zone</DropdownMenuItem>
                                        </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                 <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete "{zone.name}"?</AlertDialogTitle>
                                        <AlertDialogDescription>This action cannot be undone and will remove all delivery methods for this zone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteZone(zone.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                    <AccordionContent className="bg-muted/30">
                        <div className="p-4 space-y-3">
                        {zone.deliveryMethods.map(method => (
                            <div key={method.id} className="flex justify-between items-center p-3 border bg-background rounded-md">
                                <div>
                                    <p className="font-medium">{method.name}</p>
                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-semibold">{formatPrice(method)}</p>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openMethodDialog(zone.id, 'edit', method)}><Edit className="h-4 w-4 text-muted-foreground"/></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteMethod(zone.id, method.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={() => openMethodDialog(zone.id, 'add')}><PlusCircle className="h-4 w-4 mr-2"/> Add Delivery Method</Button>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      {/* Zone Add/Edit Dialog */}
      <Dialog open={!!dialogState} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogState?.mode === 'add' ? 'Create Shipping Zone' : 'Edit Shipping Zone'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ZoneForm zone={formData} onZoneChange={(updates) => setFormData(p => ({ ...p, ...updates }))} allCountries={countries} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState(null)}>Cancel</Button>
            <Button onClick={handleZoneSave}>Save Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Method Add/Edit Dialog */}
      <Dialog open={!!methodDialogState} onOpenChange={(open) => !open && setMethodDialogState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{methodDialogState?.mode === 'add' ? 'Add Delivery Method' : 'Edit Delivery Method'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <MethodForm method={methodFormData} onMethodChange={(updates) => setMethodFormData(p => ({ ...p, ...updates }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMethodDialogState(null)}>Cancel</Button>
            <Button onClick={handleMethodSave}>Save Method</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

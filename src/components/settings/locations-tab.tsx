
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Location } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type LocationsTabProps = {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
};

const emptyLocation: Omit<Location, 'id'> = {
  name: '',
  address: '',
  isPickupLocation: false,
  isDefault: false,
};

export function LocationsTab({ locations, setLocations }: LocationsTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newLocation, setNewLocation] = useState(emptyLocation);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewLocation(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: keyof typeof newLocation, checked: boolean) => {
    setNewLocation(prev => ({ ...prev, [id]: checked }));
  };

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.address) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a name and address for the location.',
      });
      return;
    }
    const finalLocation: Location = {
      ...newLocation,
      id: `loc_${Date.now()}`,
    };

    setLocations(prev => [...prev, finalLocation]);
    toast({
      title: 'Location Added',
      description: `Successfully added "${finalLocation.name}".`,
    });
    setNewLocation(emptyLocation);
    setIsOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
            Manage the places you stock inventory, fulfill orders, and sell products.
            </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
                <DialogDescription>
                    Create a new warehouse, store, or other place where you manage inventory.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Location Name</Label>
                    <Input id="name" placeholder="e.g., Main Warehouse" value={newLocation.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="e.g., 123 Industrial Area, Kampala" value={newLocation.address} onChange={handleInputChange} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="isPickupLocation">Enable as Pickup Point</Label>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Allow customers to select this location for in-store pickup.
                        </p>
                    </div>
                    <Switch id="isPickupLocation" checked={newLocation.isPickupLocation} onCheckedChange={(c) => handleSwitchChange('isPickupLocation', c)} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddLocation}>Add Location</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Pickup Point</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length > 0 ? locations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">
                  {location.name}
                  {location.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                </TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>
                  {location.isPickupLocation ? (
                    <Badge variant="default">Enabled</Badge>
                  ) : (
                    <Badge variant="outline">Disabled</Badge>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No locations have been added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

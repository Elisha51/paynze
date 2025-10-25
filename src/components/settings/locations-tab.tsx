

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Location } from '@/lib/types';
import { PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newLocation, setNewLocation] = useState(emptyLocation);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const { id, value } = e.target;
    if (isEdit && editingLocation) {
        setEditingLocation(prev => prev ? { ...prev, [id]: value } : null);
    } else {
        setNewLocation(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSwitchChange = (id: keyof Location, checked: boolean, isEdit = false) => {
     if (isEdit && editingLocation) {
        setEditingLocation(prev => prev ? { ...prev, [id]: checked } : null);
    } else {
        setNewLocation(prev => ({ ...prev, [id]: checked as boolean }));
    }
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
    setIsAddOpen(false);
  };
  
  const handleEditClick = (location: Location) => {
    setEditingLocation({ ...location });
    setIsEditOpen(true);
  };
  
  const handleUpdateLocation = () => {
    if (!editingLocation) return;
    
    setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? editingLocation : loc));
    toast({
        title: 'Location Updated',
        description: `Successfully updated "${editingLocation.name}".`,
    });
    setIsEditOpen(false);
    setEditingLocation(null);
  }
  
  const handleDeleteLocation = (locationId: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
    toast({
        variant: 'destructive',
        title: 'Location Deleted',
        description: 'The location has been removed.',
    });
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
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
                    <Input id="name" placeholder="e.g., Main Warehouse" value={newLocation.name} onChange={(e) => handleInputChange(e)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="e.g., 123 Industrial Area, Kampala" value={newLocation.address} onChange={(e) => handleInputChange(e)} />
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
              <TableHead className="sticky right-0 bg-background text-right">Actions</TableHead>
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
                <TableCell className="sticky right-0 bg-background text-right">
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditClick(location)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                location "{location.name}".
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteLocation(location.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No locations have been added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Location</DialogTitle>
                <DialogDescription>
                    Update the details for "{editingLocation?.name}".
                </DialogDescription>
            </DialogHeader>
            {editingLocation && (
              <div className="space-y-4 py-4">
                  <div className="space-y-2">
                      <Label htmlFor="name">Location Name</Label>
                      <Input id="name" value={editingLocation.name} onChange={(e) => handleInputChange(e, true)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" value={editingLocation.address} onChange={(e) => handleInputChange(e, true)} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                          <Label htmlFor="isPickupLocation">Enable as Pickup Point</Label>
                          <p className="text-[0.8rem] text-muted-foreground">
                              Allow customers to select this location for in-store pickup.
                          </p>
                      </div>
                      <Switch id="isPickupLocation" checked={editingLocation.isPickupLocation} onCheckedChange={(c) => handleSwitchChange('isPickupLocation', c, true)} />
                  </div>
              </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdateLocation}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </Card>
  );
}

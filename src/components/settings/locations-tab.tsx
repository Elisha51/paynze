
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Location } from '@/lib/types';
import { PlusCircle } from 'lucide-react';

type LocationsTabProps = {
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
};

export function LocationsTab({ locations, setLocations }: LocationsTabProps) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
            Manage the places you stock inventory, fulfill orders, and sell products.
            </CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Location
        </Button>
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
                <TableCell>{location.isPickupLocation ? 'Yes' : 'No'}</TableCell>
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

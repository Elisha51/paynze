
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRoles } from '@/services/roles';
import type { Role } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

export function RolesPermissionsTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function loadRoles() {
      const fetchedRoles = await getRoles();
      setRoles(fetchedRoles);
    }
    loadRoles();
  }, []);

  const handlePermissionChange = (roleName: string, permissionKey: string, value: boolean) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.name === roleName) {
          return {
            ...role,
            permissions: {
              ...role.permissions,
              [permissionKey]: value,
            },
          };
        }
        return role;
      })
    );
  };
  
  const handleSaveChanges = (roleName: string) => {
      // In a real app, you would call an API to save this.
      console.log('Saving permissions for role:', roleName);
      toast({
          title: 'Permissions Updated',
          description: `Permissions for the ${roleName} role have been saved.`,
      });
  }

  if (roles.length === 0) {
      return <div>Loading roles...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {roles.map(role => (
        <Card key={role.name}>
          <CardHeader>
            <CardTitle>{role.name}</CardTitle>
            <CardDescription>{role.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold text-sm">Permissions</h4>
            <Separator />
            <div className="space-y-4">
              {Object.entries(role.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`${role.name}-${key}`} className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={`${role.name}-${key}`}
                    checked={value}
                    onCheckedChange={(checked) => handlePermissionChange(role.name, key, checked)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSaveChanges(role.name)}>Save Changes</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

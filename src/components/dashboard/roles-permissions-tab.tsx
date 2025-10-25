
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRoles, addRole, updateRole } from '@/services/roles';
import type { Role, Permissions } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const defaultPermissions: Permissions = {
  canViewDashboard: true,
  canManageProducts: false,
  canManageOrders: false,
  canManageCustomers: false,
  canManageFinances: false,
  canManageStaff: false,
  canManageSettings: false,
};

const newRoleTemplate: Omit<Role, 'name'> = {
    description: '',
    permissions: defaultPermissions,
};


export function RolesPermissionsTab({ roles, setRoles }: { roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>}) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRole, setNewRole] = useState<{name: string, description: string}>({name: '', description: ''});

  const handlePermissionChange = (roleName: string, permissionKey: string, value: boolean) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.name === roleName) {
          // Create a new permissions object
          const newPermissions = {
            ...role.permissions,
            [permissionKey]: value,
          };
          // Return a new role object
          return {
            ...role,
            permissions: newPermissions,
          };
        }
        return role;
      })
    );
  };
  
  const handleSaveChanges = async (role: Role) => {
      await updateRole(role);
      toast({
          title: 'Permissions Updated',
          description: `Permissions for the ${role.name} role have been saved.`,
      });
  }

  const handleAddNewRole = async () => {
      if (!newRole.name) {
          toast({ variant: 'destructive', title: 'Role name is required' });
          return;
      }
      const roleToAdd: Role = {
          ...newRole,
          permissions: defaultPermissions,
          name: newRole.name as Role['name'],
      }
      const addedRole = await addRole(roleToAdd);
      setRoles(prev => [...prev, addedRole]);
      toast({ title: 'Role Added' });
      setIsAddOpen(false);
      setNewRole({name: '', description: ''});
  }


  if (roles.length === 0) {
      return <div>Loading roles...</div>
  }

  return (
    <>
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
            <Button className="w-full" onClick={() => handleSaveChanges(role)}>Save Changes</Button>
          </CardFooter>
        </Card>
      ))}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Card className="flex items-center justify-center border-2 border-dashed hover:border-primary transition-colors cursor-pointer min-h-[400px]">
              <div className="text-center">
                  <PlusCircle className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold text-muted-foreground">Add New Role</p>
              </div>
          </Card>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
                <DialogDescription>Create a custom role with a specific set of permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Role Name</Label>
                    <Input id="name" placeholder="e.g., Warehouse Manager" value={newRole.name} onChange={(e) => setNewRole({...newRole, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" placeholder="Briefly describe this role's responsibilities" value={newRole.description} onChange={(e) => setNewRole({...newRole, description: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAddNewRole}>Create Role</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}

    
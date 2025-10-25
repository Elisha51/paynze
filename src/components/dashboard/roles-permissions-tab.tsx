
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRoles, addRole, updateRole } from '@/services/roles';
import type { Role, Permissions, CrudPermissions } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const defaultPermissions: Permissions = {
  dashboard: { view: true },
  products: { view: false, create: false, edit: false, delete: false },
  orders: { view: false, create: false, edit: false, delete: false },
  customers: { view: false, create: false, edit: false, delete: false },
  procurement: { view: false, create: false, edit: false, delete: false },
  finances: { view: false, create: false, edit: false, delete: false },
  staff: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, edit: false },
};

const permissionLabels: Record<keyof CrudPermissions, string> = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete'
}

type PermissionModule = keyof Omit<Permissions, 'dashboard' | 'settings'>;
const permissionModules: PermissionModule[] = ['products', 'orders', 'customers', 'procurement', 'finances', 'staff'];

const PermissionRow = ({ module, permissions, onPermissionChange }: { module: string, permissions: CrudPermissions, onPermissionChange: (key: keyof CrudPermissions, value: boolean) => void }) => (
    <div className="space-y-3">
        <h5 className="font-semibold text-sm capitalize">{module}</h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {Object.keys(permissionLabels).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                        id={`${module}-${key}`}
                        checked={permissions[key as keyof CrudPermissions]}
                        onCheckedChange={(checked) => onPermissionChange(key as keyof CrudPermissions, !!checked)}
                    />
                    <Label htmlFor={`${module}-${key}`}>{permissionLabels[key as keyof CrudPermissions]}</Label>
                </div>
            ))}
        </div>
    </div>
);


export function RolesPermissionsTab({ roles, setRoles }: { roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>}) {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRole, setNewRole] = useState<{name: string, description: string}>({name: '', description: ''});

  const handlePermissionChange = (roleName: string, module: keyof Permissions, permissionKey: keyof CrudPermissions | keyof Permissions['settings'] | 'view', value: boolean) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.name === roleName) {
          const newPermissions = { ...role.permissions };
          const modulePermissions = { ...newPermissions[module] };
          (modulePermissions as any)[permissionKey] = value;
          newPermissions[module] = modulePermissions;
          
          return { ...role, permissions: newPermissions };
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
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <Card>
              <CardHeader className="flex-row items-center justify-between">
                  <div>
                      <CardTitle>Manage Roles</CardTitle>
                      <CardDescription>Define what each staff member can see and do in your dashboard.</CardDescription>
                  </div>
                  <DialogTrigger asChild>
                      <Button>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Role
                      </Button>
                  </DialogTrigger>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue='Admin'>
                    {roles.map(role => (
                        <AccordionItem value={role.name} key={role.name}>
                            <AccordionTrigger>
                                <div className="text-left">
                                    <h3 className="font-semibold text-lg">{role.name}</h3>
                                    <p className="text-sm text-muted-foreground">{role.description}</p>
                                </div>
                            </AccordionTrigger>
                             <AccordionContent>
                                <div className="space-y-6 pt-4">
                                     <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h5 className="font-semibold text-sm">Dashboard</h5>
                                            <p className="text-xs text-muted-foreground">Allow access to the main dashboard overview.</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${role.name}-dashboard-view`}
                                                checked={role.permissions.dashboard.view}
                                                onCheckedChange={(checked) => handlePermissionChange(role.name, 'dashboard', 'view', !!checked)}
                                            />
                                            <Label htmlFor={`${role.name}-dashboard-view`}>View</Label>
                                        </div>
                                    </div>
                                    <Separator />

                                    {permissionModules.map(module => (
                                        <PermissionRow
                                            key={module}
                                            module={module}
                                            permissions={role.permissions[module]}
                                            onPermissionChange={(key, value) => handlePermissionChange(role.name, module, key, value)}
                                        />
                                    ))}
                                    
                                     <Separator />
                                     <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h5 className="font-semibold text-sm">Settings</h5>
                                            <p className="text-xs text-muted-foreground">Allow access to store settings.</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`${role.name}-settings-view`}
                                                checked={role.permissions.settings.view}
                                                onCheckedChange={(checked) => handlePermissionChange(role.name, 'settings', 'view', !!checked)}
                                            />
                                            <Label htmlFor={`${role.name}-settings-view`} className="mr-4">View</Label>
                                            
                                            <Checkbox
                                                id={`${role.name}-settings-edit`}
                                                checked={role.permissions.settings.edit}
                                                onCheckedChange={(checked) => handlePermissionChange(role.name, 'settings', 'edit', !!checked)}
                                            />
                                            <Label htmlFor={`${role.name}-settings-edit`}>Edit</Label>
                                        </div>
                                    </div>

                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button onClick={() => handleSaveChanges(role)}>Save Changes</Button>
                                </div>
                             </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
              </CardContent>
          </Card>
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
    </>
  );
}

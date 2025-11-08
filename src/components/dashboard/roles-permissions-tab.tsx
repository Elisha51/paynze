

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateRole, addRole as serviceAddRole } from '@/services/roles';
import type { Role, Permissions, CrudPermissions, StaffRoleName, AssignableAttribute, CommissionRule } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { PlusCircle, Trash2, DollarSign } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const permissionLabels: Record<keyof CrudPermissions, string> = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete'
};

// This type is now dynamic and will include any key from the Permissions interface.
type PermissionModuleKey = keyof Permissions;

type PermissionModuleConfig = {
    key: PermissionModuleKey;
    label: string;
    type: 'simple' | 'crud';
};


const permissionConfig: PermissionModuleConfig[] = [
  { key: 'dashboard', label: 'Dashboard', type: 'simple' },
  { key: 'products', label: 'Products', type: 'crud' },
  { key: 'orders', label: 'Orders', type: 'crud' },
  { key: 'customers', label: 'Customers', type: 'crud' },
  { key: 'procurement', label: 'Procurement', type: 'crud' },
  { key: 'marketing', label: 'Marketing', type: 'crud' },
  { key: 'templates', label: 'Templates', type: 'crud' },
  { key: 'finances', label: 'Finances', type: 'crud' },
  { key: 'staff', label: 'Staff', type: 'crud' },
  { key: 'tasks', label: 'Tasks', type: 'crud' },
  { key: 'settings', label: 'Settings', type: 'simple' },
];


const PermissionRow = ({ label, permissions, onPermissionChange, type = 'crud' }: { label: string, permissions: Partial<CrudPermissions>, onPermissionChange: (key: string, value: boolean) => void, type?: 'simple' | 'crud' }) => {
    if (!permissions) {
        return null;
    }
    
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-md border p-3">
            <div className="mb-2 sm:mb-0">
                <h5 className="font-semibold text-sm capitalize">{label}</h5>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:flex sm:flex-wrap sm:gap-x-4">
                {(Object.keys(permissionLabels) as Array<keyof CrudPermissions>).map((key) => {
                    if (type === 'simple' && !['view', 'edit'].includes(key) && label !== 'Settings') {
                       if(label === 'Dashboard' && key !== 'view') return null;
                       if(label !== 'Dashboard' && label !== 'Settings') return null;
                    }
                     if (type === 'simple' && label === 'Settings' && !['view', 'edit'].includes(key)) {
                         return null;
                     }
                     if(type === 'simple' && label === 'Dashboard' && key !== 'view') {
                        return null;
                     }

                     const permissionId = `${label.replace(/\s+/g, '-')}-${key}`;
                    return (
                        <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                                id={permissionId}
                                checked={permissions[key]}
                                onCheckedChange={(checked) => onPermissionChange(key, !!checked)}
                            />
                            <Label htmlFor={permissionId} className="font-normal">{permissionLabels[key]}</Label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const emptyRole: Omit<Role, 'name'> & {name: StaffRoleName | ''} = {
    name: '',
    description: '',
    permissions: {
        dashboard: { view: true },
        products: { view: false, create: false, edit: false, delete: false },
        orders: { view: false, create: false, edit: false, delete: false },
        customers: { view: false, create: false, edit: false, delete: false },
        procurement: { view: false, create: false, edit: false, delete: false },
        marketing: { view: false, create: false, edit: false, delete: false },
        templates: { view: false, create: false, edit: false, delete: false },
        finances: { view: false, create: false, edit: false, delete: false },
        staff: { view: false, create: false, edit: false, delete: false },
        tasks: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, edit: false },
    },
    assignableAttributes: [],
    commissionRules: [],
}

export function RolesPermissionsTab({ roles: initialRoles, setRoles: setParentRoles }: { roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>}) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRole, setNewRole] = useState(emptyRole);
  
  useEffect(() => {
    setRoles(initialRoles);
  }, [initialRoles]);

  const handlePermissionChange = (roleName: string, module: keyof Permissions, permissionKey: string, value: boolean) => {
    setRoles(prevRoles =>
      prevRoles.map(role => {
        if (role.name === roleName) {
          const newPermissions = { ...role.permissions };
          const modulePermissions = { ...(newPermissions[module] || {}) };
          (modulePermissions as any)[permissionKey] = value;
          newPermissions[module] = modulePermissions;
          
          return { ...role, permissions: newPermissions };
        }
        return role;
      })
    );
  };


  const handleDescriptionChange = (roleName: string, description: string) => {
      setRoles(prevRoles =>
        prevRoles.map(role => {
            if (role.name === roleName) {
                return { ...role, description };
            }
            return role;
        })
      )
  }
  
  const handleSaveChanges = async (role: Role) => {
      await updateRole(role);
      setParentRoles(roles); // Sync state back up to the parent
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
          name: newRole.name as Role['name'],
      }
      const addedRole = await serviceAddRole(roleToAdd);
      const newRoles = [...roles, addedRole];
      setRoles(newRoles);
      setParentRoles(newRoles);
      toast({ title: 'Role Added' });
      setIsAddOpen(false);
      setNewRole(emptyRole);
  }

  const handleAttributeChange = (roleName: string, index: number, field: keyof AssignableAttribute, value: string) => {
    setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newAttributes = [...(role.assignableAttributes || [])];
                newAttributes[index] = { ...newAttributes[index], [field]: value };
                return { ...role, assignableAttributes: newAttributes };
            }
            return role;
        })
    );
  }

  const addAttribute = (roleName: string) => {
    setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newAttributes = [...(role.assignableAttributes || []), { key: '', label: '', type: 'string' }];
                return { ...role, assignableAttributes: newAttributes };
            }
            return role;
        })
    );
  }
  
  const removeAttribute = (roleName: string, index: number) => {
     setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newAttributes = (role.assignableAttributes || []).filter((_, i) => i !== index);
                return { ...role, assignableAttributes: newAttributes };
            }
            return role;
        })
    );
  }

  const handleCommissionRuleChange = (roleName: string, index: number, field: keyof CommissionRule, value: string | number) => {
    setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newRules = [...(role.commissionRules || [])];
                const rule = { ...newRules[index] };
                if (field === 'rate') {
                    rule[field] = Number(value);
                } else {
                    (rule as any)[field] = value;
                }
                newRules[index] = rule;
                return { ...role, commissionRules: newRules };
            }
            return role;
        })
    );
  }

  const addCommissionRule = (roleName: string) => {
    setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newRules = [...(role.commissionRules || []), { id: `rule-${Date.now()}`, name: 'New Rule', trigger: 'On Order Paid', type: 'Fixed Amount', rate: 0 }];
                return { ...role, commissionRules: newRules };
            }
            return role;
        })
    );
  }

  const removeCommissionRule = (roleName: string, index: number) => {
    setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newRules = (role.commissionRules || []).filter((_, i) => i !== index);
                return { ...role, commissionRules: newRules };
            }
            return role;
        })
    );
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
                <Accordion type="multiple" className="w-full">
                    {roles.map(role => (
                        <AccordionItem value={role.name} key={role.name}>
                            <AccordionTrigger>
                                <div className="flex-1 flex justify-between items-center pr-4">
                                    <div className="text-left">
                                        <h3 className="font-semibold text-lg">{role.name}</h3>
                                        <p className="text-sm text-muted-foreground">{role.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {role.commissionRules && role.commissionRules.length > 0 && <Badge variant="outline"><DollarSign className="h-3 w-3 mr-1"/>Commission</Badge>}
                                        {role.assignableAttributes && role.assignableAttributes.length > 0 && (
                                            <Badge variant="secondary">
                                                {role.assignableAttributes.length} Attribute{role.assignableAttributes.length > 1 ? 's' : ''}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </AccordionTrigger>
                             <AccordionContent>
                                <div className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`description-${role.name}`}>Role Description</Label>
                                        <Input id={`description-${role.name}`} value={role.description} onChange={(e) => handleDescriptionChange(role.name, e.target.value)} />
                                    </div>
                                    <Separator />
                                    <h4 className="font-bold text-base">Module Permissions</h4>
                                     <div className="space-y-4">
                                        {permissionConfig.map(moduleConfig => (
                                            <PermissionRow
                                                key={moduleConfig.key}
                                                label={moduleConfig.label}
                                                permissions={role.permissions[moduleConfig.key] as CrudPermissions}
                                                onPermissionChange={(key, value) => handlePermissionChange(role.name, moduleConfig.key, key, value)}
                                                type={moduleConfig.type}
                                            />
                                        ))}
                                    </div>
                                    <Separator />
                                    <h4 className="font-bold text-base">Commission Rules</h4>
                                    <p className="text-sm text-muted-foreground">Define how staff with this role earn commissions. Multiple rules can apply.</p>
                                    <div className="space-y-4">
                                        {(role.commissionRules || []).map((rule, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="flex justify-end mb-2">
                                                    <Button variant="ghost" size="icon" onClick={() => removeCommissionRule(role.name, index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="space-y-2 lg:col-span-2">
                                                        <Label htmlFor={`rule-name-${index}`}>Rule Name</Label>
                                                        <Input id={`rule-name-${index}`} value={rule.name} onChange={(e) => handleCommissionRuleChange(role.name, index, 'name', e.target.value)} placeholder="e.g. Standard Delivery Fee" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`rule-trigger-${index}`}>Trigger</Label>
                                                        <Select value={rule.trigger} onValueChange={(v) => handleCommissionRuleChange(role.name, index, 'trigger', v as CommissionRule['trigger'])}>
                                                            <SelectTrigger id={`rule-trigger-${index}`}><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="On Order Paid">On Order Paid</SelectItem>
                                                                <SelectItem value="On Order Delivered">On Order Delivered</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                     <div className="space-y-2">
                                                        <Label htmlFor={`rule-type-${index}`}>Type</Label>
                                                        <Select value={rule.type} onValueChange={(v) => handleCommissionRuleChange(role.name, index, 'type', v as CommissionRule['type'])}>
                                                            <SelectTrigger id={`rule-type-${index}`}><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                                                                <SelectItem value="Percentage of Sale">Percentage of Sale</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2 lg:col-start-4">
                                                        <Label htmlFor={`rule-rate-${index}`}>Rate ({rule.type === 'Percentage of Sale' ? '%' : 'UGX'})</Label>
                                                        <Input id={`rule-rate-${index}`} type="number" value={rule.rate} onChange={(e) => handleCommissionRuleChange(role.name, index, 'rate', e.target.value)} />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addCommissionRule(role.name)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Commission Rule
                                        </Button>
                                    </div>


                                    <Separator />
                                    <h4 className="font-bold text-base">Custom Attributes</h4>
                                    <p className="text-sm text-muted-foreground">Define custom data fields for staff members with this role. These fields will appear on their profile and can be used for tracking, assignments, or information.</p>
                                    <div className="space-y-4">
                                        {(role.assignableAttributes || []).map((attr, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`attr-label-${index}`}>Label</Label>
                                                        <Input id={`attr-label-${index}`} value={attr.label} onChange={(e) => handleAttributeChange(role.name, index, 'label', e.target.value)} placeholder="e.g. Sales Target"/>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`attr-key-${index}`}>Key</Label>
                                                        <Input id={`attr-key-${index}`} value={attr.key} onChange={(e) => handleAttributeChange(role.name, index, 'key', e.target.value)} placeholder="e.g. salesTarget" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`attr-type-${index}`}>Type</Label>
                                                         <Select value={attr.type} onValueChange={(v) => handleAttributeChange(role.name, index, 'type', v)}>
                                                            <SelectTrigger id={`attr-type-${index}`}>
                                                                <SelectValue/>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="kpi">KPI / Target</SelectItem>
                                                                <SelectItem value="tags">Tags / List</SelectItem>
                                                                <SelectItem value="string">Text</SelectItem>
                                                                <SelectItem value="number">Number</SelectItem>
                                                                <SelectItem value="date">Date</SelectItem>
                                                                <SelectItem value="boolean">Yes/No (Boolean)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end mt-2">
                                                     <Button variant="ghost" size="icon" onClick={() => removeAttribute(role.name, index)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                         <Button variant="outline" size="sm" onClick={() => addAttribute(role.name)}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Attribute
                                        </Button>
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
                      <Input id="name" placeholder="e.g., Warehouse Manager" value={newRole.name} onChange={(e) => setNewRole({...newRole, name: e.target.value as StaffRoleName})} />
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

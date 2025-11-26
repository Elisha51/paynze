
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateRole, addRole as serviceAddRole } from '@/services/roles';
import { getStaff, updateStaff } from '@/services/staff';
import type { Role, Permissions, CrudPermissions, StaffRoleName, AssignableAttribute, CommissionRule, Staff, CommissionRuleTrigger, CommissionRuleType, CommissionRuleCondition } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { PlusCircle, Trash2, DollarSign, Edit, MoreHorizontal, Settings, Wand2, TestTube2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
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
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { COMMISSION_RULE_TRIGGERS, COMMISSION_RULE_TYPES } from '@/lib/config';
import { Switch } from '../ui/switch';

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
        customers: { view: false, create: false, edit: false, delete: false, viewAll: false },
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

function CommissionRuleEditor({ rule, onRuleChange, onRemove }: { rule: CommissionRule, onRuleChange: (field: keyof CommissionRule, value: any) => void, onRemove: () => void }) {
    const [isAdvanced, setIsAdvanced] = useState(!!rule.conditions?.length || !!rule.name);

    const handleConditionChange = (condIndex: number, field: keyof CommissionRuleCondition, value: any) => {
        const newConditions = [...(rule.conditions || [])];
        const condition = {...newConditions[condIndex]};
        (condition as any)[field] = value;
        newConditions[condIndex] = condition;
        onRuleChange('conditions', newConditions);
    }
    
    const addCondition = () => {
        const newCondition: CommissionRuleCondition = { id: `cond-${Date.now()}`, subject: 'Order Total', operator: 'is greater than', value: 0};
        onRuleChange('conditions', [...(rule.conditions || []), newCondition]);
    }

    const removeCondition = (condIndex: number) => {
        const newConditions = (rule.conditions || []).filter((_, i) => i !== condIndex);
        onRuleChange('conditions', newConditions);
    }

    return (
        <Card className="p-4">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                    <Switch id={`advanced-switch-${rule.id}`} checked={isAdvanced} onCheckedChange={setIsAdvanced} />
                    <Label htmlFor={`advanced-switch-${rule.id}`}>{isAdvanced ? 'Advanced Rule' : 'Simple Rule'}</Label>
                </div>
                 <Button variant="ghost" size="icon" onClick={onRemove}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>

            {isAdvanced && (
                 <div className="space-y-2 mb-4">
                    <Label htmlFor={`rule-name-${rule.id}`}>Rule Name</Label>
                    <Input id={`rule-name-${rule.id}`} value={rule.name || ''} onChange={(e) => onRuleChange('name', e.target.value)} placeholder="e.g. High-Value Order Bonus" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor={`rule-trigger-${rule.id}`}>Trigger</Label>
                    <Select value={rule.trigger} onValueChange={(v) => onRuleChange('trigger', v as CommissionRuleTrigger)}>
                        <SelectTrigger id={`rule-trigger-${rule.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {COMMISSION_RULE_TRIGGERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`rule-type-${rule.id}`}>Type</Label>
                    <Select value={rule.type} onValueChange={(v) => onRuleChange('type', v as CommissionRuleType)}>
                        <SelectTrigger id={`rule-type-${rule.id}`}><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {COMMISSION_RULE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`rule-rate-${rule.id}`}>Rate ({rule.type === 'Percentage of Sale' ? '%' : 'UGX'})</Label>
                    <Input id={`rule-rate-${rule.id}`} type="number" value={rule.rate} onChange={(e) => onRuleChange('rate', e.target.value)} />
                </div>
            </div>
            
            {isAdvanced && (
                <div className="mt-4 pt-4 border-t space-y-4">
                    <Label>Conditions (all must be met)</Label>
                    {(rule.conditions || []).map((condition, condIndex) => (
                        <Card key={condition.id} className="p-3 bg-muted/50">
                            <div className="flex items-end gap-2">
                                <div className="grid grid-cols-3 gap-2 flex-1">
                                    <div className="space-y-1">
                                        <Label htmlFor={`cond-subject-${condIndex}`} className="text-xs">Subject</Label>
                                        <Select value={condition.subject} onValueChange={(v) => handleConditionChange(condIndex, 'subject', v)}>
                                            <SelectTrigger id={`cond-subject-${condIndex}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Order Total">Order Total</SelectItem>
                                                <SelectItem value="Product Category">Product Category</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`cond-op-${condIndex}`} className="text-xs">Operator</Label>
                                         <Select value={condition.operator} onValueChange={(v) => handleConditionChange(condIndex, 'operator', v)}>
                                            <SelectTrigger id={`cond-op-${condIndex}`}><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="is">Is</SelectItem>
                                                <SelectItem value="is not">Is Not</SelectItem>
                                                <SelectItem value="is greater than">Is Greater Than</SelectItem>
                                                <SelectItem value="is less than">Is Less Than</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`cond-val-${condIndex}`} className="text-xs">Value</Label>
                                        <Input id={`cond-val-${condIndex}`} value={condition.value} onChange={(e) => handleConditionChange(condIndex, 'value', e.target.value)} />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeCondition(condIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                            </div>
                        </Card>
                    ))}
                    <Button variant="outline" size="sm" onClick={addCondition}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Condition
                    </Button>
                </div>
            )}
        </Card>
    );
}

export function RolesPermissionsTab({ roles: initialRoles, setRoles: setParentRoles }: { roles: Role[], setRoles: React.Dispatch<React.SetStateAction<Role[]>>}) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newRole, setNewRole] = useState(emptyRole);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [originalRoleName, setOriginalRoleName] = useState<string | null>(null);
  
  useEffect(() => {
    setRoles(initialRoles);
    async function loadStaff() {
        const staffData = await getStaff();
        setAllStaff(staffData);
    }
    loadStaff();
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

  const handleSaveChanges = async (role: Role) => {
      await updateRole(role.name, role);
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
  
  const handleUpdateRole = async () => {
    if (!editingRole || !editingRole.name.trim() || !originalRoleName) {
        toast({ variant: 'destructive', title: 'Role name is required' });
        return;
    }
    
    const updatedRole = await updateRole(originalRoleName, editingRole);

    if (originalRoleName !== updatedRole.name) {
        for (const staffMember of allStaff) {
            if (staffMember.role === originalRoleName) {
                await updateStaff(staffMember.id, { role: updatedRole.name });
            }
        }
    }
    
    const newRoles = roles.map(r => r.name === originalRoleName ? updatedRole : r);
    setRoles(newRoles);
    setParentRoles(newRoles);

    toast({ title: 'Role Updated' });
    setIsEditOpen(false);
    setEditingRole(null);
    setOriginalRoleName(null);
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

  const handleCommissionRuleChange = (roleName: string, index: number, field: keyof CommissionRule, value: any) => {
    setRoles(prevRoles => 
        prevRoles.map(role => {
            if (role.name === roleName) {
                const newRules = [...(role.commissionRules || [])];
                const rule = { ...newRules[index] };
                (rule as any)[field] = value;
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
                const newRules = [...(role.commissionRules || []), { id: `rule-${Date.now()}`, trigger: 'On Order Paid', type: 'Percentage of Sale', rate: 0, conditions: [] }];
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
  
  const openEditDialog = (role: Role) => {
      setEditingRole(role);
      setOriginalRoleName(role.name); // Store the original name
      setIsEditOpen(true);
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
                      <CardTitle>Manage Roles & Permissions</CardTitle>
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
                <Alert className="mb-6">
                    <Settings className="h-4 w-4" />
                    <AlertTitle>How Roles Work</AlertTitle>
                    <AlertDescription>
                        Define roles here, then assign them to staff members on the Staff page. Changes to a role's permissions will affect all staff assigned to it.
                    </AlertDescription>
                </Alert>

                <Accordion type="multiple" className="w-full">
                    {roles.map(role => (
                        <AccordionItem value={role.name} key={role.name}>
                            <div className="flex justify-between items-center w-full hover:bg-muted/50 rounded-md">
                                <AccordionTrigger className="flex-1 py-4 px-4 hover:no-underline">
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
                                 <div className="pr-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => openEditDialog(role)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Role Details
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                             <AccordionContent>
                                <div className="space-y-6 pt-4">
                                    <Accordion type="multiple" className="w-full space-y-4">
                                        <AccordionItem value="permissions" className="border rounded-md px-4">
                                            <AccordionTrigger className="py-3">Module Permissions</AccordionTrigger>
                                            <AccordionContent className="pt-4">
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
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="commissions" className="border rounded-md px-4">
                                            <AccordionTrigger className="py-3">Commission Rules</AccordionTrigger>
                                            <AccordionContent className="pt-4">
                                                <p className="text-sm text-muted-foreground mb-4">Define how staff with this role earn commissions. Multiple rules can apply.</p>
                                                <div className="space-y-4">
                                                    {(role.commissionRules || []).map((rule, index) => (
                                                        <CommissionRuleEditor
                                                          key={rule.id}
                                                          rule={rule}
                                                          onRuleChange={(field, value) => handleCommissionRuleChange(role.name, index, field, value)}
                                                          onRemove={() => removeCommissionRule(role.name, index)}
                                                        />
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => addCommissionRule(role.name)}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Commission Rule
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <AccordionItem value="attributes" className="border rounded-md px-4">
                                            <AccordionTrigger className="py-3">Custom Attributes</AccordionTrigger>
                                            <AccordionContent className="pt-4">
                                                 <p className="text-sm text-muted-foreground mb-4">Define custom data fields for staff members with this role. These fields will appear on their profile and can be used for tracking, assignments, or information.</p>
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
                                                                <div className="flex items-end gap-2">
                                                                    <div className="space-y-2 flex-1">
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
                                                                    <Button variant="ghost" size="icon" onClick={() => removeAttribute(role.name, index)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                    <Button variant="outline" size="sm" onClick={() => addAttribute(role.name)}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Attribute
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                                <div className="flex justify-end mt-6">
                                    <Button onClick={() => handleSaveChanges(role)}>Save Changes for {role.name}</Button>
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
      
      {/* Edit Role Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
            </DialogHeader>
            {editingRole && (
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Role Name</Label>
                        <Input id="edit-name" value={editingRole.name} onChange={(e) => setEditingRole({...editingRole, name: e.target.value as StaffRoleName})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input id="edit-description" value={editingRole.description} onChange={(e) => setEditingRole({...editingRole, description: e.target.value})} />
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleUpdateRole}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

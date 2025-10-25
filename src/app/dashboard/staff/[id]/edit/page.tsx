
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Staff, Role } from '@/lib/types';
import { getStaff, updateStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DynamicAttributeInput = ({ attribute, value, onChange }: { attribute: any, value: any, onChange: (key: string, value: any) => void }) => {
    const { key } = attribute;

    const type = attribute.type as Role['assignableAttributes'][0]['type'];

    if (type === 'kpi') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor={`${key}-current`}>Current Value</Label>
                        <Input 
                            id={`${key}-current`} 
                            type="number"
                            value={value?.current || ''}
                            onChange={(e) => onChange(key, { ...value, current: Number(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${key}-goal`}>Goal Value</Label>
                        <Input 
                            id={`${key}-goal`} 
                            type="number"
                            value={value?.goal || ''}
                            onChange={(e) => onChange(key, { ...value, goal: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>
        );
    }
    
    if (type === 'string') {
        return <Input id={key} value={value || ''} onChange={(e) => onChange(key, e.target.value)} />
    }
    
    if (type === 'number') {
        return <Input id={key} type="number" value={value || ''} onChange={(e) => onChange(key, Number(e.target.value))} />
    }

    if (type === 'boolean') {
        return <Switch id={key} checked={!!value} onCheckedChange={(c) => onChange(key, c)} />
    }

    if (type === 'date') {
        return (
             <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={value ? new Date(value) : undefined}
                        onSelect={(date) => onChange(key, date)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        )
    }

    if (type === 'tags' || type === 'list') {
        return (
            <div className="space-y-2">
                <Textarea
                    id={key}
                    value={Array.isArray(value) ? value.join(', ') : ''}
                    onChange={(e) => onChange(key, e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    placeholder="Enter values separated by commas"
                />
            </div>
        );
    }

    return null;
}


export default function EditStaffPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const id = params.id as string;

    const [staffMember, setStaffMember] = useState<Staff | null>(null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);

    const selectedRole = allRoles.find(r => r.name === staffMember?.role);

    useEffect(() => {
        async function loadData() {
            if (!id) return;
            setLoading(true);
            const [staffData, rolesData] = await Promise.all([
                getStaff().then(list => list.find(s => s.id === id)),
                getRoles(),
            ]);

            setStaffMember(staffData || null);
            setAllRoles(rolesData);
            setLoading(false);
        }
        loadData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!staffMember) return;
        const { id, value } = e.target;
        setStaffMember({...staffMember, [id]: value });
    }
    
    const handleRoleChange = (roleName: Staff['role']) => {
        if (staffMember) {
            setStaffMember({
                ...staffMember,
                role: roleName,
                attributes: {}, // Reset attributes when role changes
            });
        }
    }

    const handleAttributeChange = (key: string, value: any) => {
        if (staffMember) {
            setStaffMember({
                ...staffMember,
                attributes: {
                    ...staffMember.attributes,
                    [key]: value,
                }
            });
        }
    };
    
    const handleSaveChanges = async () => {
        if (!staffMember) return;
        
        await updateStaff(staffMember);
        
        toast({
            title: 'Staff Member Updated',
            description: `${staffMember.name}'s details have been saved.`,
        });
        
        router.push(`/dashboard/staff/${staffMember.id}`);
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Card><CardContent className="p-6"><Skeleton className="h-48" /></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-32" /></CardContent></Card>
            </div>
        );
    }
    
    if (!staffMember) {
        return <div>Staff member or role not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/staff/${id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Profile</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Edit {staffMember.name}</h1>
                    <p className="text-muted-foreground">Modify details and role-specific attributes.</p>
                </div>
                <div className="ml-auto">
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Core Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={staffMember.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={staffMember.email} onChange={handleInputChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" value={staffMember.phone || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                             <Select value={staffMember.role} onValueChange={handleRoleChange}>
                                <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                                <SelectContent>
                                    {allRoles.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedRole?.assignableAttributes && selectedRole.assignableAttributes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Attributes</CardTitle>
                        <CardDescription>
                            Set and update the custom attributes for the <span className="font-semibold">{selectedRole.name}</span> role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {selectedRole.assignableAttributes.map(attr => (
                            <div key={attr.key} className="space-y-2">
                                <Label htmlFor={attr.key} className="font-semibold">{attr.label}</Label>
                                <DynamicAttributeInput
                                    attribute={attr}
                                    value={staffMember.attributes?.[attr.key]}
                                    onChange={handleAttributeChange}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

        </div>
    );
}

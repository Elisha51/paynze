
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CalendarIcon, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StaffProfileForm } from './staff-profile-form'; // Re-use the form for core details
import { updateStaff, getStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import type { Staff, Role, AssignableAttribute } from '@/lib/types';
import { FileUploader } from '../ui/file-uploader';
import { Badge } from '../ui/badge';


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


export function StaffForm({ initialStaff }: { initialStaff?: Staff | null }) {
    const router = useRouter();
    const { toast } = useToast();

    const [staffMember, setStaffMember] = useState<Staff | null>(initialStaff || null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    
    const selectedRole = allRoles.find(r => r.name === staffMember?.role);

    useEffect(() => {
        async function loadRoles() {
            const rolesData = await getRoles();
            setAllRoles(rolesData);
        }
        loadRoles();
    }, []);

    if (!staffMember) {
        return <div>Loading...</div>; // Or a skeleton loader
    }
    
    const handleCoreInfoSave = async (updatedStaff: Staff) => {
        // This function is passed to the StaffProfileForm.
        // It updates the state here in the main form.
        setStaffMember(updatedStaff);
    };

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
    
     const handleVerificationDocsChange = (files: File[]) => {
        const newDocs = files.map(file => ({ name: file.name, url: URL.createObjectURL(file) }));
        setStaffMember(prev => prev ? ({ ...prev, verificationDocuments: [...(prev.verificationDocuments || []), ...newDocs] }) : null);
    }
    
    const removeDocument = (docName: string) => {
        setStaffMember(prev => prev ? ({ ...prev, verificationDocuments: prev.verificationDocuments?.filter(d => d.name !== docName) }) : null);
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/dashboard/staff/${staffMember.id}`}>
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

            <StaffProfileForm 
                staff={staffMember}
                onSave={handleCoreInfoSave}
                onCancel={() => router.push(`/dashboard/staff/${staffMember.id}`)}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Role</CardTitle>
                    <CardDescription>Assign a role to determine permissions and available attributes.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                         <Select value={staffMember.role} onValueChange={handleRoleChange}>
                            <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                            <SelectContent>
                                {allRoles.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Verification Documents</CardTitle>
                    <CardDescription>Upload identity or other verification documents for this staff member.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FileUploader 
                        files={[]}
                        onFilesChange={handleVerificationDocsChange}
                        maxFiles={5}
                        accept={{ 'application/pdf': ['.pdf'], 'image/*': ['.jpeg', '.jpg', '.png'] }}
                    />
                    {staffMember.verificationDocuments && staffMember.verificationDocuments.length > 0 && (
                        <div className="space-y-2">
                            <Label>Uploaded Documents</Label>
                            <div className="space-y-2">
                                {staffMember.verificationDocuments.map(doc => (
                                    <div key={doc.name} className="flex items-center justify-between p-2 border rounded-md bg-muted">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            <span className="text-sm font-medium">{doc.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => removeDocument(doc.name)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Calendar, X, FileText, Clock, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn, getInitials } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import type { Staff, Role, AssignableAttribute, Shift } from '@/lib/types';
import { FileUploader } from '../ui/file-uploader';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';


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
                    <Calendar className="mr-2 h-4 w-4" />
                    {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <CalendarComponent
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

const daysOfWeek: Shift['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


export function StaffForm({ initialStaff }: { initialStaff?: Staff | null }) {
    const router = useRouter();
    const { toast } = useToast();
    const [staffMember, setStaffMember] = useState<Staff | null>(initialStaff || null);
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();

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

    const handleCoreInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setStaffMember(prev => prev ? ({...prev, [id]: value }) : null);
    };
    
    const handleAvatarFileChange = (files: File[]) => {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    };
    
    const handleCropComplete = async () => {
        if (!imageToCrop || !crop || !crop.width || !crop.height || !staffMember) return;

        const image = new Image();
        image.src = imageToCrop;
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            toast({ variant: 'destructive', title: "Could not process image." });
            return;
        }

        ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
        const croppedImageUrl = canvas.toDataURL('image/jpeg');
        
        setStaffMember({ ...staffMember, avatarUrl: croppedImageUrl });
        setImageToCrop(null);
    };

    const handleRoleChange = (roleName: Staff['role']) => {
        if (staffMember) {
            setStaffMember({
                ...staffMember,
                role: roleName,
                attributes: {}, 
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

    const handleShiftChange = (day: Shift['day'], field: 'startTime' | 'endTime', value: string) => {
        if (staffMember) {
            const newSchedule = [...(staffMember.schedule || [])];
            let shift = newSchedule.find(s => s.day === day);

            if (shift) {
                shift[field] = value;
            } else {
                newSchedule.push({ day, startTime: '', endTime: '', [field]: value });
            }

            setStaffMember({ ...staffMember, schedule: newSchedule });
        }
    }

    const toggleDay = (day: Shift['day'], checked: boolean) => {
         if (staffMember) {
            let newSchedule = [...(staffMember.schedule || [])];
            if (checked) {
                if (!newSchedule.some(s => s.day === day)) {
                    newSchedule.push({ day, startTime: '09:00', endTime: '17:00' });
                }
            } else {
                newSchedule = newSchedule.filter(s => s.day !== day);
            }
            setStaffMember({ ...staffMember, schedule: newSchedule });
        }
    }

    const handleBack = () => {
        router.back();
    }


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
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
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update name, contact details, and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={staffMember.avatarUrl} alt={staffMember.name} />
                            <AvatarFallback>{getInitials(staffMember.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 flex-1">
                             <Label>Profile Picture</Label>
                             <FileUploader 
                                files={[]}
                                onFilesChange={handleAvatarFileChange}
                                maxFiles={1}
                                accept={{ 'image/*': ['.jpeg', '.jpg', '.png'] }}
                             />
                             <p className="text-xs text-muted-foreground">Recommended size: 200x200px. Max 2MB.</p>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={staffMember.name} onChange={handleCoreInfoChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={staffMember.email} onChange={handleCoreInfoChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={staffMember.phone || ''} onChange={handleCoreInfoChange} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Role & Permissions</CardTitle>
                    <CardDescription>Assign a role to determine what this staff member can see and do.</CardDescription>
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
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Set the working hours for this staff member.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {daysOfWeek.map(day => {
                        const shift = staffMember?.schedule?.find(s => s.day === day);
                        const isEnabled = !!shift;
                        return (
                             <div key={day} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Switch id={`switch-${day}`} checked={isEnabled} onCheckedChange={(c) => toggleDay(day, c)} />
                                        <Label htmlFor={`switch-${day}`} className="font-semibold">{day}</Label>
                                    </div>
                                </div>
                                {isEnabled && (
                                     <div className="grid grid-cols-2 gap-4 pl-8">
                                        <div className="space-y-1">
                                            <Label htmlFor={`start-${day}`} className="text-xs">Start Time</Label>
                                            <Input id={`start-${day}`} type="time" value={shift.startTime} onChange={(e) => handleShiftChange(day, 'startTime', e.target.value)} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor={`end-${day}`} className="text-xs">End Time</Label>
                                            <Input id={`end-${day}`} type="time" value={shift.endTime} onChange={(e) => handleShiftChange(day, 'endTime', e.target.value)} />
                                        </div>
                                    </div>
                                )}
                                <Separator />
                            </div>
                        )
                    })}
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

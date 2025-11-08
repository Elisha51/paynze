
'use client';
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Role, Staff } from '@/lib/types';
import { addStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { useAuth } from '@/context/auth-context';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';

export default function AddStaffPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Staff['role']>('Sales Agent');
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    
    const canCreate = user?.permissions.staff.create;

    useEffect(() => {
        async function loadRoles() {
            const rolesData = await getRoles();
            setAllRoles(rolesData.filter(r => r.name !== 'Affiliate'));
        }
        loadRoles();
    }, []);

    const handleAddStaff = async () => {
        if (!name || !email || !role) {
            toast({ variant: 'destructive', title: 'All fields are required.' });
            return;
        }

        await addStaff({
            name,
            email,
            role,
            status: 'Pending Verification',
        });
        toast({ title: 'Staff Member Added', description: `${name} has been added and is pending verification.`});
        router.push('/dashboard/staff');
    }
    
    const cta = <Button onClick={handleAddStaff}><Save className="mr-2 h-4 w-4" /> Add Staff Member</Button>;

    if (!canCreate) {
        return (
            <DashboardPageLayout title="Add New Staff Member">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You do not have permission to create new staff members.</p>
                        <Button variant="outline" onClick={() => router.back()} className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                        </Button>
                    </CardContent>
                </Card>
            </DashboardPageLayout>
        )
    }

    return (
        <DashboardPageLayout title="Add New Staff Member" description="An invitation will be sent to their email to set up their account." cta={cta}>
            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Member Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jane Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. jane.doe@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(v) => setRole(v)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {allRoles.map(r => <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardPageLayout>
    );
}

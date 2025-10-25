
'use client';
import { ArrowLeft, Save } from 'lucide-react';
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
import Link from 'next/link';
import { useState } from 'react';
import type { Staff } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addStaff } from '@/services/staff';
import { useRouter } from 'next/navigation';

const emptyStaff: Omit<Staff, 'id'> = {
  name: '',
  email: '',
  role: 'Sales Agent',
  status: 'Active',
};

export default function AddStaffPage() {
  const [staff, setStaff] = useState(emptyStaff);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setStaff(prev => ({...prev, [id]: value}));
  };
  
  const handleRoleChange = (value: Staff['role']) => {
    setStaff(prev => ({...prev, role: value}));
  }

  const handleSave = async () => {
    if (!staff.name || !staff.email) {
      toast({ variant: 'destructive', title: 'Name and email are required.'});
      return;
    }
    await addStaff(staff);
    toast({ title: 'Staff Member Added'});
    router.push('/dashboard/staff');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/staff">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Staff Member</h1>
          <p className="text-muted-foreground text-sm">Fill in the details to create a new staff profile.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save Member
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Staff Details</CardTitle>
        </CardHeader>
        <CardContent className="max-w-2xl space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={staff.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={staff.email} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={staff.role} onValueChange={handleRoleChange}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Sales Agent">Sales Agent</SelectItem>
                        <SelectItem value="Delivery Rider">Delivery Rider</SelectItem>
                        <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                    </SelectContent>
                </Select>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}

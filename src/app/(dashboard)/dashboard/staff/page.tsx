
'use client';
import { useState, useEffect } from 'react';
import type { Staff, Role } from '@/lib/types';
import { getStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Settings, Activity, Users } from 'lucide-react';
import Link from 'next/link';
import { StaffWidget } from '@/components/dashboard/staff-widget';
import { RolesPermissionsTab } from '@/components/dashboard/roles-permissions-tab';
import { StaffActivityLog } from '@/components/dashboard/staff-activity-log';
import { useAuth } from '@/context/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTransaction } from '@/services/finances';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-staff');
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false);
  const [bonusDetails, setBonusDetails] = useState({ staffId: '', amount: 0, reason: '' });
  const { toast } = useToast();
  const { user } = useAuth();

  const canCreate = user?.permissions.staff.create;
  const canEdit = user?.permissions.staff.edit;

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [staffData, rolesData] = await Promise.all([getStaff(), getRoles()]);
      setStaff(staffData.filter(s => s.role !== 'Affiliate'));
      setRoles(rolesData.filter(r => r.name !== 'Affiliate'));
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleOpenBonusDialog = (member: Staff) => {
    setBonusDetails({ staffId: member.id, amount: 0, reason: ''});
    setIsBonusDialogOpen(true);
  }

  const handleAwardBonus = async () => {
      if (!bonusDetails.staffId || bonusDetails.amount <= 0 || !bonusDetails.reason) {
          toast({ variant: 'destructive', title: 'Please fill all bonus details.' });
          return;
      }
      const staffMember = staff.find(s => s.id === bonusDetails.staffId);
      if (!staffMember) return;

      await addTransaction({
          date: new Date().toISOString(),
          description: `Bonus for ${staffMember.name}: ${bonusDetails.reason}`,
          amount: -bonusDetails.amount,
          type: 'Expense',
          category: 'Salaries',
          status: 'Pending',
          paymentMethod: 'Other',
          currency: staffMember.currency || 'UGX',
      });
      toast({ title: 'Bonus Awarded', description: `An expense has been logged for ${staffMember.name}.` });
      setIsBonusDialogOpen(false);
  }


  const tabs = [
    { value: 'all-staff', label: 'All Staff', icon: Users, permission: true },
    { value: 'roles', label: 'Roles & Permissions', icon: Settings, permission: canEdit },
    { value: 'activity', label: 'Activity Log', icon: Activity, permission: true },
  ].filter(tab => tab.permission);

  return (
    <>
      <DashboardPageLayout
        title="Staff Management"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={
            canCreate ? (
                <Button asChild>
                    <Link href="/dashboard/staff/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Staff</Link>
                </Button>
            ) : null
        }
      >
        <DashboardPageLayout.TabContent value="all-staff">
            <DashboardPageLayout.Content>
                <StaffWidget staff={staff} isLoading={isLoading} onAwardBonus={handleOpenBonusDialog} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
        {canEdit && (
          <DashboardPageLayout.TabContent value="roles">
            <DashboardPageLayout.Content>
              <RolesPermissionsTab roles={roles} setRoles={setRoles} />
            </DashboardPageLayout.Content>
          </DashboardPageLayout.TabContent>
        )}
        <DashboardPageLayout.TabContent value="activity">
            <DashboardPageLayout.Content>
              <StaffActivityLog staff={staff} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
      </DashboardPageLayout>

       <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Award Bonus / Adjustment</DialogTitle>
                <DialogDescription>Log a bonus or other payment adjustment for a staff member. This will create an expense transaction.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="staffId">Staff Member</Label>
                    <Select value={bonusDetails.staffId} onValueChange={(v) => setBonusDetails({...bonusDetails, staffId: v})}>
                        <SelectTrigger><SelectValue placeholder="Select staff..." /></SelectTrigger>
                        <SelectContent>
                            {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" value={bonusDetails.amount} onChange={(e) => setBonusDetails({...bonusDetails, amount: Number(e.target.value)})} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Input id="reason" value={bonusDetails.reason} onChange={(e) => setBonusDetails({...bonusDetails, reason: e.target.value})} placeholder="e.g. Q2 Performance Bonus"/>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAwardBonus}>Award Bonus</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    
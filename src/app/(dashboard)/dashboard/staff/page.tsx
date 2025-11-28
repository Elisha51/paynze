
'use client';
import { useState, useEffect } from 'react';
import type { Staff } from '@/lib/types';
import { getStaff, updateStaff } from '@/services/staff';
import { DashboardPageLayout } from '@/components/layout/dashboard-page-layout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Settings, Activity, Users, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { StaffTable } from '@/components/dashboard/staff-table';
import { StaffActivityLog } from '@/components/dashboard/staff-activity-log';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { PendingVerificationsTable } from '@/components/dashboard/pending-verifications-table';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-staff');
  const { user } = useAuth();
  const { toast } = useToast();

  const canCreate = user?.permissions.staff.create;
  const canEdit = user?.permissions.staff.edit;

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const staffData = await getStaff();
      setStaff(staffData.filter(s => s.role !== 'Affiliate')); // Exclude affiliates
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleStatusUpdate = async (staffId: string, status: 'Active' | 'Deactivated' | 'Rejected', reason?: string) => {
    const originalStaff = [...staff];
    const staffToUpdate = originalStaff.find(s => s.id === staffId);
    if (!staffToUpdate) return;
    
    const optimisticData = staff.map(s => s.id === staffId ? { ...s, status } : s);
    setStaff(optimisticData);

    try {
        await updateStaff(staffId, { status, rejectionReason: reason });
        toast({ title: 'Staff Status Updated', description: `${staffToUpdate.name}'s status has been set to ${status}.` });
    } catch (e) {
        setStaff(originalStaff);
        toast({ variant: 'destructive', title: 'Update failed', description: 'Could not update staff status.'});
    }
  };


  const internalStaff = staff.filter(s => s.role !== 'Affiliate');
  const pendingStaff = internalStaff.filter(s => s.status === 'Pending Verification');

  const tabs = [
    { value: 'all-staff', label: 'All Staff', icon: Users, permission: true },
    ...(pendingStaff.length > 0 ? [{ value: 'pending', label: 'Pending', count: pendingStaff.length }] : []),
    { value: 'activity', label: 'Activity Log', icon: Activity, permission: true },
  ];

  const ctaButtons = (
    <div className="flex gap-2">
        {canEdit && (
            <Button asChild variant="outline">
                <Link href="/dashboard/settings?tab=staff"><Settings className="mr-2 h-4 w-4" /> Roles & Permissions</Link>
            </Button>
        )}
        {canCreate && (
            <Button asChild>
                <Link href="/dashboard/staff/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Staff</Link>
            </Button>
        )}
    </div>
  )

  return (
    <>
      <DashboardPageLayout
        title="Staff Management"
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cta={ctaButtons}
      >
        <DashboardPageLayout.TabContent value="all-staff">
            <DashboardPageLayout.Content>
                <StaffTable staff={internalStaff} setStaff={setStaff} isLoading={isLoading} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>

        <DashboardPageLayout.TabContent value="pending">
            <DashboardPageLayout.Content>
                <PendingVerificationsTable 
                    pendingStaff={pendingStaff}
                    onStatusUpdate={handleStatusUpdate}
                    isLoading={isLoading}
                />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>

        <DashboardPageLayout.TabContent value="activity">
            <DashboardPageLayout.Content>
              <StaffActivityLog staff={staff} />
            </DashboardPageLayout.Content>
        </DashboardPageLayout.TabContent>
      </DashboardPageLayout>
    </>
  );
}


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

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-staff');
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
                <StaffWidget staff={staff} isLoading={isLoading} />
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
    </>
  );
}

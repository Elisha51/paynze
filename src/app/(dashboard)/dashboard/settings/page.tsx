
'use client';
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { LocationsTab } from "@/components/settings/locations-tab";
import { getLocations } from "@/services/locations";
import type { Location } from "@/lib/types";
import { useEffect, useState } from "react";
import { StaffWidget } from "@/components/dashboard/staff-widget";
import { RolesPermissionsTab } from "@/components/dashboard/roles-permissions-tab";
import type { Role, Staff } from '@/lib/types';
import { getStaff } from '@/services/staff';
import { getRoles } from '@/services/roles';
import { GeneralSettings } from "@/components/settings/general-settings";
import { ShippingSettings } from "@/components/settings/shipping-settings";
import { PaymentsSettings } from "@/components/settings/payments-settings";
import { NotificationsSettings } from "@/components/settings/notifications-settings";
import { DomainSettings } from "@/components/settings/domain-settings";
import { ThemeSettings } from "@/components/settings/theme-settings";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [activeTab, setActiveTab] = useState('general');
    const [roles, setRoles] = useState<Role[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [locs, rolesData, staffData] = await Promise.all([
                getLocations(),
                getRoles(),
                getStaff(),
            ]);
            setLocations(locs);
            setRoles(rolesData.filter(r => r.name !== 'Affiliate'));
            setStaff(staffData.filter(s => s.role !== 'Affiliate'));
            setIsLoading(false);
        }
        loadData();
    }, []);

    const tabs = [
        { value: "general", label: "General" },
        { value: "storefront", label: "Storefront" },
        { value: "locations", label: "Locations" },
        { value: "shipping", label: "Shipping" },
        { value: "payments", label: "Payments" },
        { value: "notifications", label: "Notifications" },
        { value: "staff", label: "Staff & Permissions" },
    ];

    return (
        <DashboardPageLayout 
            title="Settings"
            tabs={tabs}
            cta={<></>}
            activeTab={activeTab}
            onTabChange={setActiveTab}
        >
            <DashboardPageLayout.TabContent value="general">
              <DashboardPageLayout.Content>
                <GeneralSettings />
              </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="storefront">
              <DashboardPageLayout.Content>
                <div className="space-y-6">
                    <DomainSettings />
                    <Separator />
                    <ThemeSettings />
                </div>
              </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="locations">
                 <DashboardPageLayout.Content>
                    <LocationsTab locations={locations} setLocations={setLocations}/>
                 </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="shipping">
                <DashboardPageLayout.Content>
                    <ShippingSettings />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="payments">
                <DashboardPageLayout.Content>
                    <PaymentsSettings />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="notifications">
                <DashboardPageLayout.Content>
                    <NotificationsSettings />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="staff">
                <DashboardPageLayout.Content>
                    <RolesPermissionsTab roles={roles} setRoles={setRoles} />
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
        </DashboardPageLayout>
    )
}

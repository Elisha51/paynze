
'use client';
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { LocationsTab } from "@/components/settings/locations-tab";
import { getLocations } from "@/services/locations";
import type { Location } from "@/lib/types";
import { useEffect, useState } from "react";

export default function SettingsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        async function loadData() {
            const locs = await getLocations();
            setLocations(locs);
        }
        loadData();
    }, []);

    const tabs = [
        { value: "general", label: "General" },
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
                <p>General settings coming soon.</p>
              </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="locations">
                 <DashboardPageLayout.Content>
                    <LocationsTab locations={locations} setLocations={setLocations}/>
                 </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="shipping">
                <DashboardPageLayout.Content>
                    <p>Shipping settings coming soon.</p>
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="payments">
                <DashboardPageLayout.Content>
                    <p>Payment settings coming soon.</p>
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
             <DashboardPageLayout.TabContent value="notifications">
                <DashboardPageLayout.Content>
                    <p>Notification settings coming soon.</p>
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
            <DashboardPageLayout.TabContent value="staff">
                <DashboardPageLayout.Content>
                    <p>Staff settings coming soon.</p>
                </DashboardPageLayout.Content>
            </DashboardPageLayout.TabContent>
        </DashboardPageLayout>
    )
}

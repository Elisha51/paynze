'use client';

import { useState, useEffect } from 'react';
import type { Staff, Role } from '@/lib/types';
import { PayoutsTable } from './payouts-table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, User, Users, FileText } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

type PayoutsReportProps = {
    staff: Staff[];
    roles: Role[];
    onAwardBonus: () => void;
}

export function PayoutsReport({ staff, roles, onAwardBonus }: PayoutsReportProps) {
    const { user } = useAuth();
    const canEditFinances = user?.permissions.finances.edit;

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="bg-muted p-3 rounded-md">
                        <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <CardTitle>Commissions & Payouts</CardTitle>
                        <CardDescription>Track, manage, and process payouts for your staff and affiliates.</CardDescription>
                    </div>
                </div>
                <div className="flex gap-2">
                    {canEditFinances && (
                        <Button variant="outline" onClick={onAwardBonus}>
                            <Award className="mr-2 h-4 w-4" />
                            Award Bonus / Adjustment
                        </Button>
                    )}
                    <Button variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <PayoutsTable 
                    staff={staff}
                    roles={roles}
                />
            </CardContent>
        </Card>
    );
}


'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Code } from 'lucide-react';

export function DeveloperSettings() {
    const isDevMode = process.env.NODE_ENV === 'development';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Developer Settings</CardTitle>
                <CardDescription>These settings are for development and testing purposes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="devMode">Developer Mode</Label>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Simulates 'Enterprise' plan to unlock all features.
                        </p>
                    </div>
                    <Switch
                        id="devMode"
                        checked={isDevMode}
                        disabled // Controlled by environment variable
                    />
                </div>
                 <Alert>
                    <Code className="h-4 w-4" />
                    <AlertTitle>Environment Controlled</AlertTitle>
                    <AlertDescription>
                        Developer Mode is automatically enabled when the application is run in a development environment.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
}

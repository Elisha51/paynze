
'use client';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { AffiliateProgramSettings } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

const initialSettings: AffiliateProgramSettings = {
    programStatus: 'Inactive',
    commissionType: 'Percentage',
    commissionRate: 10,
    payoutThreshold: 50000,
    cookieDuration: 30,
}

export function AffiliateSettings() {
    const [settings, setSettings] = useState<AffiliateProgramSettings>(initialSettings);
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('affiliateSettings');
        if (data) {
            setSettings(JSON.parse(data));
        }
    }, []);

    const handleSwitchChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({...prev, programStatus: checked ? 'Active' : 'Inactive' }));
    };

    const handleSettingChange = (field: keyof AffiliateProgramSettings, value: string | number) => {
        setSettings(prev => ({...prev, [field]: value}));
    };

    const handleSave = () => {
        localStorage.setItem('affiliateSettings', JSON.stringify(settings));
        toast({ title: 'Affiliate Settings Saved' });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Affiliate Program</CardTitle>
                <CardDescription>Set up and manage your own affiliate marketing program.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="programStatus">Affiliate Program Status</Label>
                        <p className="text-[0.8rem] text-muted-foreground">
                            Enable or disable your affiliate program.
                        </p>
                    </div>
                    <Switch
                        id="programStatus"
                        checked={settings.programStatus === 'Active'}
                        onCheckedChange={(checked) => handleSwitchChange('programStatus', checked)}
                    />
                </div>
                
                {settings.programStatus === 'Active' && (
                    <div className="space-y-4">
                        <div className="space-y-4 rounded-md border p-4">
                            <h4 className="font-medium">Commission Structure</h4>
                             <RadioGroup value={settings.commissionType} onValueChange={(v) => handleSettingChange('commissionType', v)} className="flex space-x-4">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Percentage" id="percentage" /><Label htmlFor="percentage">Percentage</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="Fixed Amount" id="fixed" /><Label htmlFor="fixed">Fixed Amount</Label></div>
                             </RadioGroup>
                             <div className="space-y-2">
                                <Label htmlFor="commissionRate">
                                    Commission Rate {settings.commissionType === 'Percentage' ? '(%)' : '(UGX)'}
                                </Label>
                                <Input 
                                    id="commissionRate" 
                                    type="number"
                                    value={settings.commissionRate}
                                    onChange={(e) => handleSettingChange('commissionRate', Number(e.target.value))}
                                    className="w-[180px]"
                                />
                             </div>
                        </div>

                        <div className="space-y-4 rounded-md border p-4">
                            <h4 className="font-medium">Payout Settings</h4>
                             <div className="space-y-2">
                                <Label htmlFor="payoutThreshold">
                                    Payout Threshold (UGX)
                                </Label>
                                <Input 
                                    id="payoutThreshold" 
                                    type="number"
                                    value={settings.payoutThreshold}
                                    onChange={(e) => handleSettingChange('payoutThreshold', Number(e.target.value))}
                                    className="w-[180px]"
                                />
                                <p className="text-xs text-muted-foreground">The minimum commission an affiliate must earn before they can be paid out.</p>
                             </div>
                        </div>

                         <div className="space-y-4 rounded-md border p-4">
                            <h4 className="font-medium">Referral Settings</h4>
                             <div className="space-y-2">
                                <Label htmlFor="cookieDuration">
                                    Referral Cookie Duration
                                </Label>
                                 <Select value={String(settings.cookieDuration)} onValueChange={(v) => handleSettingChange('cookieDuration', Number(v))}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select duration..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 days</SelectItem>
                                        <SelectItem value="30">30 days</SelectItem>
                                        <SelectItem value="60">60 days</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">How long a referral link click is tracked for commission.</p>
                             </div>
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}

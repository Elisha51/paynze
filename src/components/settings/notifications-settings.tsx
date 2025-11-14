
'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { Mail, MessageSquare, Smartphone } from 'lucide-react';
import type { EmailTemplate, SmsTemplate, WhatsAppTemplate } from '@/lib/types';


const triggers = [
  { event: 'New order placed', purpose: 'Confirm order', channels: ['Email', 'SMS', 'WhatsApp'] },
  { event: 'Payment completed', purpose: 'Send receipt', channels: ['Email', 'WhatsApp'] },
  { event: 'Order shipped', purpose: 'Tracking link', channels: ['SMS', 'WhatsApp'] },
  { event: 'Abandoned cart', purpose: 'Recover sales', channels: ['Email', 'WhatsApp'] },
];

const mockTemplates = {
    Email: [ {id: 'email-1', name: 'Order Confirmation Template'}, {id: 'email-2', name: 'Shipping Update Template'}],
    SMS: [ {id: 'sms-1', name: 'Order Shipped SMS'}, {id: 'sms-2', name: 'Delivery Reminder SMS'}],
    WhatsApp: [ {id: 'wa-1', name: 'WhatsApp Order Receipt'}, {id: 'wa-2', name: 'WhatsApp Delivery Update'}],
};


function AutomationRow({ trigger, purpose, availableChannels }: { trigger: string, purpose: string, availableChannels: string[] }) {
    const [enabled, setEnabled] = useState(true);
    const [selectedChannels, setSelectedChannels] = useState<string[]>(availableChannels);
    const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);

    const handleChannelChange = (channel: string, checked: boolean) => {
        if (checked) {
            setSelectedChannels(prev => [...prev, channel]);
        } else {
            setSelectedChannels(prev => prev.filter(c => c !== channel));
        }
    };
    
    const channelIcons: Record<string, React.ElementType> = {
        Email: Mail,
        SMS: MessageSquare,
        WhatsApp: Smartphone,
    };

    return (
        <div className="flex flex-col space-y-3 rounded-lg border p-4">
             <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label htmlFor={`switch-${trigger}`} className="font-semibold">{trigger}</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                        {purpose}
                    </p>
                </div>
                <Switch id={`switch-${trigger}`} checked={enabled} onCheckedChange={setEnabled} />
            </div>
            {enabled && (
                <div className="space-y-4 pt-2 border-t">
                    <div className="space-y-2">
                        <Label className="text-xs">Channels</Label>
                        <div className="flex items-center gap-4">
                            {availableChannels.map(channel => {
                                const Icon = channelIcons[channel];
                                return (
                                    <div key={channel} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`check-${trigger}-${channel}`} 
                                            checked={selectedChannels.includes(channel)}
                                            onCheckedChange={(c) => handleChannelChange(channel, c as boolean)}
                                        />
                                        <Label htmlFor={`check-${trigger}-${channel}`} className="flex items-center gap-1.5 font-normal">
                                            <Icon className="h-4 w-4 text-muted-foreground"/> {channel}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="text-xs">Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(mockTemplates).map(([channel, templates]) => {
                                    if(selectedChannels.includes(channel)) {
                                       return templates.map(template => (
                                         <SelectItem key={template.id} value={template.id}>{template.name} ({channel})</SelectItem>
                                       ))
                                    }
                                    return null;
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}

export function NotificationsSettings() {
  const [storeNotifications, setStoreNotifications] = useState({
    newOrders: true,
    lowStock: true,
  });

  const handleStoreChange = (id: keyof typeof storeNotifications) => {
    setStoreNotifications(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Store Notifications</CardTitle>
                <CardDescription>Notifications sent to you and your staff dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="newOrders">New Orders</Label>
                        <p className="text-[0.8rem] text-muted-foreground">Receive a notification for every new order placed.</p>
                    </div>
                    <Switch id="newOrders" checked={storeNotifications.newOrders} onCheckedChange={() => handleStoreChange('newOrders')} />
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        <Label htmlFor="lowStock">Low Stock Alerts</Label>
                        <p className="text-[0.8rem] text-muted-foreground">Get notified when product inventory runs low.</p>
                    </div>
                    <Switch id="lowStock" checked={storeNotifications.lowStock} onCheckedChange={() => handleStoreChange('lowStock')} />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Automated Communications</CardTitle>
                <CardDescription>Configure automated Email, SMS, and WhatsApp messages for key events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {triggers.map(trigger => (
                    <AutomationRow 
                        key={trigger.event}
                        trigger={trigger.event}
                        purpose={trigger.purpose}
                        availableChannels={trigger.channels}
                    />
                ))}
            </CardContent>
             <CardFooter>
                <Button>Save Changes</Button>
            </CardFooter>
        </Card>
    </div>
  );
}

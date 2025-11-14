'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';
import type { EmailTemplate, SmsTemplate, WhatsAppTemplate } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Input } from '../ui/input';


const triggers = [
  { event: 'New order placed', purpose: 'Confirm order', channels: ['Email', 'SMS', 'WhatsApp'] },
  { event: 'Payment completed', purpose: 'Send receipt', channels: ['Email', 'WhatsApp'] },
  { event: 'Order shipped', purpose: 'Tracking link', channels: ['SMS', 'WhatsApp'] },
  { event: 'Delivery day', purpose: 'Reminder', channels: ['SMS'] },
  { event: 'Abandoned cart', purpose: 'Recover sales', channels: ['Email', 'WhatsApp'], defaultDelay: { value: 1, unit: 'hours' } },
  { event: 'Supplier low stock', purpose: 'Request restock', channels: ['Email', 'WhatsApp'] },
  { event: 'New discount campaign', purpose: 'Marketing', channels: ['Email', 'WhatsApp'] },
  { event: 'New visitor subscribed', purpose: 'Welcome flow', channels: ['Email'] },
];

const mockTemplates = {
    Email: [ {id: 'email-1', name: 'Order Confirmation Template'}, {id: 'email-2', name: 'Shipping Update Template'}],
    SMS: [ {id: 'sms-1', name: 'Order Shipped SMS'}, {id: 'sms-2', name: 'Delivery Reminder SMS'}],
    WhatsApp: [ {id: 'wa-1', name: 'WhatsApp Order Receipt'}, {id: 'wa-2', name: 'WhatsApp Delivery Update'}],
};


function AutomationRow({ trigger, purpose, availableChannels, defaultDelay }: { trigger: string, purpose: string, availableChannels: string[], defaultDelay?: {value: number, unit: string} }) {
    const [enabled, setEnabled] = useState(true);
    const [selectedChannels, setSelectedChannels] = useState<string[]>(availableChannels);
    const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(undefined);
    const [schedule, setSchedule] = useState<'immediately' | 'delayed'>(defaultDelay ? 'delayed' : 'immediately');
    const [delayValue, setDelayValue] = useState(defaultDelay?.value || 1);
    const [delayUnit, setDelayUnit] = useState(defaultDelay?.unit || 'hours');

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
                <div className="space-y-4 pt-4 border-t">
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
                     <div className="space-y-3">
                        <Label className="text-xs flex items-center gap-1.5"><Clock className="h-4 w-4"/> Timing</Label>
                        <RadioGroup value={schedule} onValueChange={(v) => setSchedule(v as 'immediately' | 'delayed')} className="flex items-center gap-4">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="immediately" id={`sched-imm-${trigger}`} />
                                <Label htmlFor={`sched-imm-${trigger}`} className="font-normal">Immediately</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="delayed" id={`sched-del-${trigger}`} />
                                <Label htmlFor={`sched-del-${trigger}`} className="font-normal">After a delay</Label>
                            </div>
                        </RadioGroup>
                        {schedule === 'delayed' && (
                            <div className="flex items-center gap-2 pl-6">
                                <Input 
                                    type="number" 
                                    value={delayValue}
                                    onChange={(e) => setDelayValue(Number(e.target.value))}
                                    className="w-20 h-8"
                                />
                                <Select value={delayUnit} onValueChange={setDelayUnit}>
                                    <SelectTrigger className="w-28 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minutes">minutes</SelectItem>
                                        <SelectItem value="hours">hours</SelectItem>
                                        <SelectItem value="days">days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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
                        defaultDelay={trigger.defaultDelay}
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

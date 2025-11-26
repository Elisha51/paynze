
'use client';

import { Save, Sparkles, Image as ImageIcon, ShieldAlert, Check, ChevronsUpDown, Calendar as CalendarIcon, Repeat, X, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Campaign, CampaignBanner, Affiliate, CustomerGroup, RecurringSchedule } from '@/lib/types';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Switch } from '../ui/switch';
import { FileUploader } from '../ui/file-uploader';
import { useAuth } from '@/context/auth-context';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { getAffiliates } from '@/services/affiliates';
import { getCustomerGroups } from '@/services/customer-groups';
import { format, setHours, setMinutes } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { AnimatePresence, motion } from 'framer-motion';

const emptyCampaign: Partial<Campaign> = {
  name: '',
  description: '',
  status: 'Draft',
  channel: 'Email',
  audience: 'All Customers',
  affiliateAccess: 'none',
  allowedAffiliateIds: [],
  scheduleType: undefined,
  recurring: {
    frequency: 'Weeks',
    interval: 1,
    daysOfWeek: [],
    dayOfMonth: 1,
    weekOfMonth: 'first',
    dayOfWeek: 'Sunday',
    startTime: '09:00',
    endTime: '17:00'
  },
  banner: {
    enabled: false,
    type: 'Announcement',
    size: 'standard',
    title: '',
    description: '',
    ctaText: 'Shop Now',
    ctaLink: '',
    imageUrl: '',
  }
};

type CampaignFormProps = {
    initialCampaign?: Campaign | null;
}

const TimePicker = ({ date, onTimeChange }: { date: Date, onTimeChange: (newDate: Date) => void }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];
    
    const handleHourChange = (hour: string) => {
        onTimeChange(setHours(date, parseInt(hour)));
    };

    const handleMinuteChange = (minute: string) => {
        onTimeChange(setMinutes(date, parseInt(minute)));
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={String(date.getHours()).padStart(2, '0')} onValueChange={handleHourChange}>
                <SelectTrigger className="w-[70px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
            </Select>
            <span>:</span>
            <Select value={String(date.getMinutes()).padStart(2, '0')} onValueChange={handleMinuteChange}>
                <SelectTrigger className="w-[70px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
             <span className="text-xs text-muted-foreground">(24h format)</span>
        </div>
    )
}

export function CampaignForm({ initialCampaign }: CampaignFormProps) {
    const [campaign, setCampaign] = useState<Partial<Campaign>>({
        ...emptyCampaign,
        ...initialCampaign,
        scheduleType: initialCampaign?.scheduleType || 'one-time'
    });
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
    
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialCampaign?.startDate ? new Date(initialCampaign.startDate) : new Date()
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialCampaign?.endDate ? new Date(initialCampaign.endDate) : undefined
    );
    const [noEndDate, setNoEndDate] = useState(!initialCampaign?.endDate);

    const router = useRouter();
    const { toast } = useToast();
    const isEditing = !!initialCampaign;
    const { user } = useAuth();
    const canCreateBanners = user?.plan === 'Pro' || user?.plan === 'Enterprise';

    useEffect(() => {
        if (initialCampaign) {
            setCampaign(prev => ({
                ...prev, 
                ...initialCampaign,
                scheduleType: initialCampaign.scheduleType || 'one-time'
            }));
            if (initialCampaign.startDate) setStartDate(new Date(initialCampaign.startDate));
            if (initialCampaign.endDate) {
                setEndDate(new Date(initialCampaign.endDate));
                setNoEndDate(false);
            } else {
                setNoEndDate(true);
            }
        }

        async function loadData() {
            const [affiliateData, customerGroupData] = await Promise.all([
                getAffiliates(),
                getCustomerGroups()
            ]);
            setAffiliates(affiliateData.filter(a => a.status === 'Active'));
            setCustomerGroups(customerGroupData);
        }
        loadData();
    }, [initialCampaign]);
    
    useEffect(() => {
        if (noEndDate) {
            setEndDate(undefined);
        }
    }, [noEndDate]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCampaign(prev => ({ ...prev, [id]: value }));
    };
    
    const handleRichTextChange = (value: string) => {
        setCampaign(prev => ({ ...prev, description: value }));
    }

    const handleSelectChange = (id: 'status' | 'channel' | 'audience' | 'affiliateAccess', value: string) => {
        setCampaign(prev => ({...prev, [id]: value as any}));
    }
    
    const handleBannerChange = (field: keyof CampaignBanner, value: string | boolean | CampaignBanner['size']) => {
        setCampaign(prev => ({
            ...prev,
            banner: {
                ...(prev.banner || {} as CampaignBanner),
                [field]: value,
            }
        }))
    }
    
    const handleBannerImageUpload = (files: (File | { url: string; id: string })[]) => {
        if (files.length > 0) {
            const file = files[0];
            const url = file instanceof File ? URL.createObjectURL(file) : file.url;
            handleBannerChange('imageUrl', url);
        } else {
            handleBannerChange('imageUrl', '');
        }
    }
    
    const handleAffiliateSelect = (affiliateId: string) => {
        setCampaign(prev => {
            const currentIds = prev.allowedAffiliateIds || [];
            const newIds = currentIds.includes(affiliateId)
                ? currentIds.filter(id => id !== affiliateId)
                : [...currentIds, affiliateId];
            return { ...prev, allowedAffiliateIds: newIds };
        })
    }

    const handleRecurringChange = (field: keyof RecurringSchedule, value: any) => {
        setCampaign(prev => ({
            ...prev,
            recurring: {
                ...(prev.recurring || { frequency: 'Weeks', interval: 1, daysOfWeek: [] }),
                [field]: value
            }
        }));
    };

    const toggleRecurringDay = (day: string) => {
        const currentDays = campaign.recurring?.daysOfWeek || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        handleRecurringChange('daysOfWeek', newDays);
    }
    
    const handleSave = () => {
        const finalCampaign: Partial<Campaign> = {
            ...campaign,
            startDate: startDate?.toISOString(),
            endDate: noEndDate ? undefined : endDate?.toISOString(),
        };

        console.log("Saving campaign", finalCampaign);
        toast({
            title: isEditing ? "Campaign Updated" : "Campaign Created",
            description: `Campaign "${finalCampaign.name}" has been saved.`
        });
        router.push('/dashboard/marketing?tab=campaigns');
    }

    return (
         <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input id="name" value={campaign.name || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="description">Message / Content</Label>
                                    <Button variant="ghost" size="sm" disabled>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate with AI
                                    </Button>
                                </div>
                                 <RichTextEditor
                                    id="description"
                                    value={campaign.description || ''}
                                    onChange={handleRichTextChange}
                                    placeholder="Compose your campaign message here..."
                                />
                             </div>
                        </CardContent>
                    </Card>
                    
                    {canCreateBanners ? (
                         <Card>
                            <CardHeader>
                                <CardTitle>Storefront Banner</CardTitle>
                                <CardDescription>Feature this campaign in a banner on your storefront homepage.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="banner-enabled" checked={campaign.banner?.enabled} onCheckedChange={(c) => handleBannerChange('enabled', c)} />
                                    <Label htmlFor="banner-enabled">Enable banner for this campaign</Label>
                                </div>
                                {campaign.banner?.enabled && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label htmlFor="banner-title">Banner Title</Label>
                                            <Input id="banner-title" value={campaign.banner.title} onChange={(e) => handleBannerChange('title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="banner-size">Banner Size</Label>
                                            <Select value={campaign.banner.size} onValueChange={(v) => handleBannerChange('size', v as CampaignBanner['size'])}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard">Standard (3:1)</SelectItem>
                                                    <SelectItem value="large">Large (2:1)</SelectItem>
                                                    <SelectItem value="square">Square (1:1)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="banner-description">Banner Description</Label>
                                            <Input id="banner-description" value={campaign.banner.description} onChange={(e) => handleBannerChange('description', e.target.value)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="banner-ctaText">CTA Button Text</Label>
                                                <Input id="banner-ctaText" value={campaign.banner.ctaText} onChange={(e) => handleBannerChange('ctaText', e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="banner-ctaLink">CTA Link</Label>
                                                <Input id="banner-ctaLink" value={campaign.banner.ctaLink} onChange={(e) => handleBannerChange('ctaLink', e.target.value)} placeholder="/store/product/SKU-123"/>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Banner Image</Label>
                                            <FileUploader 
                                                files={campaign.banner.imageUrl ? [{id: 'banner-img', url: campaign.banner.imageUrl}] : []}
                                                onFilesChange={handleBannerImageUpload}
                                                maxFiles={1}
                                            />
                                            <p className="text-xs text-muted-foreground">Recommended dimensions: 1200x400 for standard, 1200x600 for large, 800x800 for square.</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                         <Card>
                            <CardHeader>
                                <CardTitle>Storefront Banner</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Alert>
                                    <ShieldAlert className="h-4 w-4" />
                                    <AlertTitle>Upgrade to Unlock</AlertTitle>
                                    <AlertDescription>
                                        Storefront banners are available on the Pro plan and above. 
                                        <Button variant="link" asChild className="p-0 h-auto ml-1"><Link href="#">Upgrade your plan</Link></Button> to start using this feature.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={campaign.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="channel">Channel</Label>
                                <Select value={campaign.channel} onValueChange={(v) => handleSelectChange('channel', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Email">Email</SelectItem>
                                        <SelectItem value="SMS">SMS</SelectItem>
                                        <SelectItem value="Push">Push Notification</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="audience">Audience</Label>
                                 <Select value={campaign.audience} onValueChange={(v) => handleSelectChange('audience', v)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Customers">All Customers</SelectItem>
                                        <SelectItem value="New Customers">New Customers</SelectItem>
                                        {customerGroups.map(group => (
                                          <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={campaign.scheduleType}
                                onValueChange={(v) => setCampaign(p => ({...p, scheduleType: v as any}))}
                                className="grid grid-cols-2 gap-4"
                            >
                                <Label htmlFor="r1" className={cn("flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground", campaign.scheduleType === 'one-time' && 'border-primary')}>
                                    <RadioGroupItem value="one-time" id="r1" className="sr-only" />
                                    <CalendarIcon className="mb-3 h-6 w-6" />
                                    One-time
                                </Label>
                                <Label htmlFor="r2" className={cn("flex flex-col items-center justify-between rounded-md border-2 p-4 cursor-pointer hover:bg-accent hover:text-accent-foreground", campaign.scheduleType === 'recurring' && 'border-primary')}>
                                    <RadioGroupItem value="recurring" id="r2" className="sr-only" />
                                    <Repeat className="mb-3 h-6 w-6" />
                                    Recurring
                                </Label>
                            </RadioGroup>
                            
                            <AnimatePresence>
                            {campaign.scheduleType && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <Separator className="my-4" />
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Start Date & Time</Label>
                                            <div className="flex items-center gap-2">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={startDate} onSelect={setStartDate} /></PopoverContent>
                                                </Popover>
                                                {startDate && <TimePicker date={startDate} onTimeChange={setStartDate} />}
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label>End Date & Time</Label>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="no-end-date" checked={noEndDate} onCheckedChange={(c) => setNoEndDate(c as boolean)} />
                                                <Label htmlFor="no-end-date" className="font-normal">No end date</Label>
                                            </div>
                                             {!noEndDate && (
                                                <div className="flex items-center gap-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className={cn("flex-1 justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={endDate} onSelect={setEndDate} /></PopoverContent>
                                                    </Popover>
                                                    {endDate && <TimePicker date={endDate} onTimeChange={setEndDate} />}
                                                </div>
                                             )}
                                        </div>
                                        
                                        {campaign.scheduleType === 'recurring' && (
                                            <div className="space-y-4 pt-4 border-t">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor="recurring-freq" className="text-sm">Repeats every</Label>
                                                    <Input
                                                        id="recurring-interval"
                                                        type="number"
                                                        value={campaign.recurring?.interval || 1}
                                                        onChange={(e) => handleRecurringChange('interval', parseInt(e.target.value) || 1)}
                                                        className="w-16 h-8"
                                                        min={1}
                                                    />
                                                    <Select value={campaign.recurring?.frequency} onValueChange={(v) => handleRecurringChange('frequency', v as any)}>
                                                        <SelectTrigger id="recurring-freq" className="w-[120px] h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Days">Days</SelectItem>
                                                            <SelectItem value="Weeks">Weeks</SelectItem>
                                                            <SelectItem value="Months">Months</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {campaign.recurring?.frequency === 'Weeks' && (
                                                    <div className="pl-4">
                                                        <Label className="text-xs">On these days</Label>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                                <Button key={day} variant={(campaign.recurring?.daysOfWeek || []).includes(day) ? 'default' : 'outline'} size="sm" onClick={() => toggleRecurringDay(day)}>{day}</Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {campaign.recurring?.frequency === 'Months' && (
                                                  <div className="pl-4 grid grid-cols-2 gap-4 items-center">
                                                    <RadioGroup defaultValue="dayOfMonth" className="flex flex-col space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="dayOfMonth" id="month-day"/>
                                                            <Label htmlFor="month-day" className="font-normal flex items-center gap-2">On day
                                                              <Input type="number" defaultValue={15} className="w-16 h-8"/>
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="dayOfWeek" id="month-weekday"/>
                                                            <Label htmlFor="month-weekday" className="font-normal flex items-center gap-2">On the
                                                               <Select defaultValue="first">
                                                                <SelectTrigger className="w-28 h-8"><SelectValue/></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="first">first</SelectItem>
                                                                    <SelectItem value="second">second</SelectItem>
                                                                    <SelectItem value="third">third</SelectItem>
                                                                    <SelectItem value="fourth">fourth</SelectItem>
                                                                    <SelectItem value="last">last</SelectItem>
                                                                </SelectContent>
                                                               </Select>
                                                               <Select defaultValue="Monday">
                                                                <SelectTrigger className="w-28 h-8"><SelectValue/></SelectTrigger>
                                                                <SelectContent>
                                                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                                                </SelectContent>
                                                               </Select>
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                  </div>
                                                )}

                                                <div className="space-y-2 pt-4">
                                                    <Label className="text-sm">Active between</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input type="time" value={campaign.recurring?.startTime} onChange={(e) => handleRecurringChange('startTime', e.target.value)} className="h-8"/>
                                                        <span className="text-sm text-muted-foreground">and</span>
                                                        <Input type="time" value={campaign.recurring?.endTime} onChange={(e) => handleRecurringChange('endTime', e.target.value)} className="h-8"/>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Affiliate Access</CardTitle>
                            <CardDescription>Control which affiliates can see and use this campaign.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup value={campaign.affiliateAccess} onValueChange={(v) => handleSelectChange('affiliateAccess', v)} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="aff-none" />
                                    <Label htmlFor="aff-none">No Affiliates (Store Only)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="aff-all" />
                                    <Label htmlFor="aff-all">All Affiliates</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="specific" id="aff-specific" />
                                    <Label htmlFor="aff-specific">Specific Affiliates</Label>
                                </div>
                            </RadioGroup>
                            
                            {campaign.affiliateAccess === 'specific' && (
                                <div className="space-y-2 pt-2">
                                    <Label>Allowed Affiliates</Label>
                                     <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between h-auto min-h-10">
                                                <div className="flex flex-wrap gap-1">
                                                    {(campaign.allowedAffiliateIds || []).length > 0
                                                        ? (campaign.allowedAffiliateIds || []).map(id => {
                                                            const affiliate = affiliates.find(a => a.id === id);
                                                            return <Badge key={id} variant="secondary">{affiliate?.name || id}</Badge>;
                                                        })
                                                        : "Select affiliates..."
                                                    }
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                            <Command>
                                                <CommandInput placeholder="Search affiliates..." />
                                                <CommandEmpty>No affiliates found.</CommandEmpty>
                                                <CommandGroup>
                                                    {affiliates.map((affiliate) => (
                                                    <CommandItem
                                                        key={affiliate.id}
                                                        value={affiliate.name}
                                                        onSelect={() => handleAffiliateSelect(affiliate.id)}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", (campaign.allowedAffiliateIds || []).includes(affiliate.id) ? "opacity-100" : "opacity-0")} />
                                                        {affiliate.name}
                                                    </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}


    

'use client';

import { Save, Sparkles, Image as ImageIcon, ShieldAlert, Check, ChevronsUpDown, Calendar as CalendarIcon, Repeat, X } from 'lucide-react';
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
import type { Campaign, CampaignBanner, Affiliate, CustomerGroup } from '@/lib/types';
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
import { setHours, setMinutes, format } from 'date-fns';
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
  startDate: new Date().toISOString(),
  affiliateAccess: 'none',
  allowedAffiliateIds: [],
  scheduleType: 'one-time',
  recurring: {
    type: 'Daily',
    days: [],
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

const DateTimePicker = ({ date, setDate }: { date: Date | undefined, setDate: (date: Date | undefined) => void }) => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
        if (!date) {
            let newDate = new Date();
            if (type === 'hours') newDate = setHours(newDate, parseInt(value));
            if (type === 'minutes') newDate = setMinutes(newDate, parseInt(value));
            setDate(newDate);
            return;
        };
        let newDate = new Date(date);
        if (type === 'hours') {
            newDate = setHours(newDate, parseInt(value));
        } else {
            newDate = setMinutes(newDate, parseInt(value));
        }
        setDate(newDate);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP p") : <span>Pick a date and time</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => setDate(d)}
                    initialFocus
                />
                 <div className="p-3 border-t border-border">
                    <div className="flex items-center gap-2">
                        <Label>Time</Label>
                        <Select
                            value={date ? format(date, 'HH') : '09'}
                            onValueChange={(v) => handleTimeChange('hours', v)}
                        >
                            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                        <span>:</span>
                         <Select
                            value={date ? format(date, 'mm') : '00'}
                            onValueChange={(v) => handleTimeChange('minutes', v)}
                        >
                            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>{minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};


export function CampaignForm({ initialCampaign }: CampaignFormProps) {
    const [campaign, setCampaign] = useState<Partial<Campaign>>(initialCampaign || emptyCampaign);
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>(initialCampaign?.startDate ? new Date(initialCampaign.startDate) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(initialCampaign?.endDate ? new Date(initialCampaign.endDate) : undefined);
    const [noEndDate, setNoEndDate] = useState(!initialCampaign?.endDate);


    const router = useRouter();
    const { toast } = useToast();
    const isEditing = !!initialCampaign;
    const { user } = useAuth();
    const canCreateBanners = user?.plan === 'Pro' || user?.plan === 'Enterprise';

    useEffect(() => {
        if (initialCampaign) {
            setCampaign(prev => ({...prev, ...initialCampaign}));
            if (initialCampaign.startDate) {
                setStartDate(new Date(initialCampaign.startDate));
            }
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

    const handleRecurringChange = (field: keyof NonNullable<Campaign['recurring']>, value: any) => {
        setCampaign(prev => ({
            ...prev,
            recurring: {
                ...(prev.recurring || { type: 'Daily', days: [], startTime: '09:00', endTime: '17:00' }),
                [field]: value
            }
        }));
    };

    const toggleRecurringDay = (day: string) => {
        const currentDays = campaign.recurring?.days || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        handleRecurringChange('days', newDays);
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
                        <CardContent>
                            <RadioGroup
                                value={campaign.scheduleType || 'one-time'}
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
                                    <Separator className="my-6" />
                                    {campaign.scheduleType === 'one-time' ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Start Date & Time</Label>
                                                <DateTimePicker date={startDate} setDate={setStartDate} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>End Date & Time</Label>
                                                <DateTimePicker date={endDate} setDate={setEndDate} />
                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox id="no-end-date" checked={noEndDate} onCheckedChange={(checked) => setNoEndDate(checked as boolean)} />
                                                    <Label htmlFor="no-end-date" className="text-sm font-normal">
                                                        No end date (run continuously)
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                             <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Start Date & Time</Label>
                                                    <DateTimePicker date={startDate} setDate={setStartDate} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Date & Time</Label>
                                                    <DateTimePicker date={endDate} setDate={setEndDate} />
                                                </div>
                                            </div>
                                            <Separator/>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Repeats</Label>
                                                    <Select value={campaign.recurring?.type} onValueChange={(v) => handleRecurringChange('type', v)}>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Daily">Daily</SelectItem>
                                                            <SelectItem value="Weekly">Weekly</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                {campaign.recurring?.type === 'Weekly' && (
                                                    <div className="space-y-2">
                                                        <Label>On these days</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                                <Button key={day} variant={(campaign.recurring?.days || []).includes(day) ? 'default' : 'outline'} size="sm" onClick={() => toggleRecurringDay(day)}>{day}</Button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
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

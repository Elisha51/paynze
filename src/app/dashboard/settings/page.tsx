
'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingFormData } from '@/context/onboarding-context';
import { LocationsTab } from '@/components/settings/locations-tab';
import type { Location, ShippingZone, AffiliateProgramSettings } from '@/lib/types';
import { getLocations as fetchLocations } from '@/services/locations';
import { PlusCircle, Trash2, Globe, Wallet, Truck, Shield, Brush, Users, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCountryList } from '@/services/countries';
import { useAuth } from '@/context/auth-context';
import { FileUploader } from '@/components/ui/file-uploader';
import Image from 'next/image';

export default function SettingsPage() {
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [logoFile, setLogoFile] = useState<(File | {url:string})[]>([]);
    const [affiliateSettings, setAffiliateSettings] = useState<AffiliateProgramSettings>({
        programStatus: 'Inactive',
        commissionType: 'Percentage',
        commissionRate: 10,
        payoutThreshold: 50000,
        cookieDuration: 30,
    });
    const [locations, setLocations] = useState<Location[]>([]);
    const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
    const [activeTab, setActiveTab] = useState('store');
    const [countryList, setCountryList] = useState<{name: string, code: string}[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    const canEdit = user?.permissions.settings.edit;

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedData = JSON.parse(data);
            setSettings(parsedData);
            if (parsedData.logoUrl) {
                setLogoFile([{ url: parsedData.logoUrl }]);
            }
        }
        
        const affiliateData = localStorage.getItem('affiliateSettings');
        if (affiliateData) {
            setAffiliateSettings(JSON.parse(affiliateData));
        }

        async function loadData() {
            const [fetchedLocations, fetchedCountries] = await Promise.all([
                fetchLocations(),
                getCountryList()
            ]);
            setLocations(fetchedLocations);
            setCountryList(fetchedCountries);
        }
        loadData();
        // Mock initial shipping zones
        setShippingZones([
            { id: 'zone-1', name: 'Kampala Metro', countries: ['UG'], cities: ['Kampala'], deliveryMethods: [{ id: 'dm-1', name: 'Flat Rate', price: 10000 }] },
            { id: 'zone-2', name: 'Nationwide Uganda', countries: ['UG'], cities: [], deliveryMethods: [{ id: 'dm-2', name: 'Flat Rate', price: 25000 }] }
        ]);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        const { id, value } = e.target;
        setSettings(prev => prev ? { ...prev, [id]: value } : null);
    };
    
    const handleLogoChange = (files: (File | {url: string})[]) => {
        setLogoFile(files);
        // In a real app, you'd upload this file and get back a URL
        // For simulation, we'll just use a local URL.
        if (files.length > 0 && files[0] instanceof File) {
             const localUrl = URL.createObjectURL(files[0]);
             setSettings(prev => (prev ? {...prev, logoUrl: localUrl} : null));
        } else if (files.length === 0) {
            setSettings(prev => (prev ? {...prev, logoUrl: ''} : null));
        }
    }

    const handleSelectChange = (id: 'currency' | 'language', value: string) => {
        if (!settings) return;
        setSettings(prev => prev ? { ...prev, [id]: value } : null);
    };

    const handleSwitchChange = (id: 'cod' | 'mobileMoney' | 'pickup' | 'enableLowStockAlerts', checked: boolean) => {
        if (!settings) return;

        if (id === 'pickup') {
            setSettings(prev => prev ? { ...prev, delivery: { ...prev.delivery, [id]: checked } } : null);
        } else if (id === 'enableLowStockAlerts') {
            setSettings(prev => prev ? { ...prev, inventory: { ...prev.inventory, [id]: checked } } : null);
        }
        else {
            setSettings(prev => prev ? { ...prev, paymentOptions: { ...prev.paymentOptions, [id]: checked } } : null);
        }
    };
    
    const handleAddZone = () => {
        const newZone: ShippingZone = {
            id: `zone_${Date.now()}`,
            name: 'New Shipping Zone',
            countries: [],
            cities: [],
            deliveryMethods: [{ id: `dm_${Date.now()}`, name: 'Flat Rate', price: 0 }]
        };
        setShippingZones(prev => [...prev, newZone]);
    }
    
    const handleZoneChange = (zoneId: string, field: 'name' | 'price' | 'countries', value: any) => {
        setShippingZones(prev => prev.map(zone => {
            if (zone.id === zoneId) {
                if (field === 'name') {
                    return { ...zone, name: value as string };
                }
                if (field === 'price') {
                    const newMethods = [...zone.deliveryMethods];
                    newMethods[0] = { ...newMethods[0], price: Number(value) };
                    return { ...zone, deliveryMethods: newMethods };
                }
                if (field === 'countries') {
                    return { ...zone, countries: value as string[] };
                }
            }
            return zone;
        }))
    }
    
    const handleRemoveZone = (zoneId: string) => {
        setShippingZones(prev => prev.filter(zone => zone.id !== zoneId));
    };

    const handleAffiliateSettingChange = (field: keyof AffiliateProgramSettings, value: any) => {
        setAffiliateSettings(prev => ({...prev, [field]: value}));
    };

    const handleSaveChanges = () => {
        if (settings) {
            localStorage.setItem('onboardingData', JSON.stringify(settings));
        }
        localStorage.setItem('affiliateSettings', JSON.stringify(affiliateSettings));
        toast({
            title: 'Settings Saved',
            description: 'Your changes have been saved successfully.',
        });
    }

  return (
    <>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store's settings, locations, payment methods, and delivery options.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="store" className="gap-2"><Brush className="h-4 w-4" />Store</TabsTrigger>
          <TabsTrigger value="locations" className="gap-2"><Globe className="h-4 w-4"/>Locations</TabsTrigger>
          <TabsTrigger value="payments" className="gap-2"><Wallet className="h-4 w-4"/>Payments</TabsTrigger>
          <TabsTrigger value="delivery" className="gap-2"><Truck className="h-4 w-4"/>Delivery</TabsTrigger>
          <TabsTrigger value="affiliates" className="gap-2"><Users className="h-4 w-4"/>Affiliates</TabsTrigger>
          <TabsTrigger value="inventory" className="gap-2"><Package className="h-4 w-4"/>Inventory</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4"/>Security</TabsTrigger>
        </TabsList>
        <TabsContent value="store" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand & Identity</CardTitle>
              <CardDescription>
                Update your store's name, description, and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label>Logo</Label>
                 {logoFile.length > 0 ? (
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 relative">
                            <Image 
                                src={logoFile[0] instanceof File ? URL.createObjectURL(logoFile[0]) : logoFile[0].url} 
                                alt="logo preview" 
                                fill 
                                className="object-contain rounded-md border p-1" 
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="logo-upload-button" className="cursor-pointer">
                                <Button as="span" variant="outline">Change Logo</Button>
                            </label>
                            <Button variant="destructive" size="sm" onClick={() => handleLogoChange([])}>Remove</Button>
                        </div>
                         <div className="hidden">
                            <FileUploader 
                                id="logo-upload-button"
                                files={logoFile}
                                onFilesChange={handleLogoChange}
                                maxFiles={1}
                                accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'] }}
                            />
                        </div>
                    </div>
                ) : (
                    <FileUploader 
                        files={logoFile}
                        onFilesChange={handleLogoChange}
                        maxFiles={1}
                        accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpeg', '.jpg'] }}
                    />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={settings?.businessName || ''} onChange={handleInputChange} disabled={!canEdit} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Domain</Label>
                <div className="flex items-center">
                    <Input id="subdomain" value={settings?.subdomain || ''} onChange={handleInputChange} disabled={!canEdit} />
                    <span className="ml-2 text-muted-foreground">.paynze.app</span>
                </div>
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Store Currency</Label>
                    <Select value={settings?.currency || 'UGX'} onValueChange={(v) => handleSelectChange('currency', v)} disabled={!canEdit}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                            <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                            <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="language">Store Language</Label>
                    <Select value={settings?.language || 'English'} onValueChange={(v) => handleSelectChange('language', v)} disabled={!canEdit}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Swahili">Swahili</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations" className="mt-6">
            <LocationsTab locations={locations} setLocations={setLocations} />
        </TabsContent>
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>
                Configure how you want to receive payments from your customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <Label htmlFor="cod" className="flex flex-col space-y-1">
                    <span>Cash on Delivery (COD)</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Accept cash payments upon delivery.
                    </span>
                  </Label>
                  <Switch id="cod" checked={settings?.paymentOptions.cod} onCheckedChange={(c) => handleSwitchChange('cod', c)} disabled={!canEdit} />
                </CardHeader>
              </Card>
               <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                     <Label htmlFor="mobileMoney" className="flex flex-col space-y-1">
                        <span>Local Mobile Money</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Accept payments via M-Pesa, MTN, Airtel etc.
                        </span>
                     </Label>
                     <Switch id="mobileMoney" checked={settings?.paymentOptions.mobileMoney} onCheckedChange={(c) => handleSwitchChange('mobileMoney', c)} disabled={!canEdit} />
                  </div>
                </CardHeader>
                {settings?.paymentOptions.mobileMoney && (
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Your Paynze account is automatically set up to receive local mobile money payments.</p>
                        <div className="space-y-2">
                             <Label htmlFor="mpesaTill">M-Pesa Till Number (Optional)</Label>
                            <Input id="mpesaTill" placeholder="e.g. 123456" disabled={!canEdit} />
                        </div>
                    </CardContent>
                )}
              </Card>
              <Card>
                <CardHeader>
                    <Label className="flex flex-col space-y-1">
                        <span>Pesapal</span>
                    </Label>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pesapalKey">Consumer Key</Label>
                        <Input id="pesapalKey" placeholder="Enter your Pesapal consumer key" disabled={!canEdit} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pesapalSecret">Consumer Secret</Label>
                        <Input id="pesapalSecret" placeholder="Enter your Pesapal consumer secret" disabled={!canEdit} />
                    </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                     <Label className="flex flex-col space-y-1">
                        <span>Flutterwave / Paystack</span>
                    </Label>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="flutterwaveKey">Public Key</Label>
                        <Input id="flutterwaveKey" placeholder="Enter your public key" disabled={!canEdit} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="flutterwaveSecret">Secret Key</Label>
                        <Input id="flutterwaveSecret" placeholder="Enter your secret key" disabled={!canEdit} />
                    </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delivery" className="mt-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Pickup Points</CardTitle>
                    <CardDescription>
                        Allow customers to pick up their orders from your locations. Manage pickup points in the <button onClick={() => setActiveTab('locations')} className="text-primary p-0 h-auto bg-transparent shadow-none underline">Locations</button> tab.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {locations.filter(l => l.isPickupLocation).length > 0 ? (
                             <ul className="list-disc list-inside space-y-1 text-sm">
                                {locations.filter(l => l.isPickupLocation).map(loc => (
                                    <li key={loc.id}><strong>{loc.name}:</strong> {loc.address}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No pickup points enabled. Go to the 'Locations' tab to enable them.</p>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Shipping Zones & Rates</CardTitle>
                        <CardDescription>
                            Create zones to set different delivery fees for different areas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {shippingZones.map((zone) => (
                           <Card key={zone.id}>
                               <CardHeader className="flex-row items-center justify-between gap-4">
                                 <div className="flex-1 space-y-2">
                                    <Input 
                                        className="text-lg font-semibold border-0 shadow-none -ml-3 w-full p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
                                        value={zone.name}
                                        onChange={(e) => handleZoneChange(zone.id, 'name', e.target.value)}
                                        disabled={!canEdit}
                                    />
                                    <Select value={zone.countries[0]} onValueChange={(v) => handleZoneChange(zone.id, 'countries', [v])} disabled={!canEdit}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countryList.map(c => (
                                                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                 </div>
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveZone(zone.id)} disabled={!canEdit}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                               </CardHeader>
                               <CardContent>
                                    <Label htmlFor={`zone-price-${zone.id}`}>Flat Rate Price ({settings?.currency || '...'})</Label>
                                    <Input
                                        id={`zone-price-${zone.id}`}
                                        type="number"
                                        value={zone.deliveryMethods[0].price}
                                        onChange={(e) => handleZoneChange(zone.id, 'price', e.target.value)}
                                        disabled={!canEdit}
                                    />
                               </CardContent>
                           </Card>
                        ))}
                         <Button variant="outline" onClick={handleAddZone} disabled={!canEdit}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Shipping Zone
                         </Button>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
         <TabsContent value="affiliates" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Affiliate Program</CardTitle>
                    <CardDescription>
                        Configure settings for your affiliate marketing program.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <Label htmlFor="programStatus" className="text-base font-semibold">Program Status</Label>
                                <p className="text-sm text-muted-foreground">Enable or disable your entire affiliate program.</p>
                            </div>
                            <Switch 
                                id="programStatus" 
                                checked={affiliateSettings.programStatus === 'Active'}
                                onCheckedChange={(checked) => handleAffiliateSettingChange('programStatus', checked ? 'Active' : 'Inactive')}
                                disabled={!canEdit}
                            />
                        </CardHeader>
                    </Card>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Commission &amp; Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Commission Type &amp; Rate</Label>
                                    <div className="flex gap-2">
                                        <Select
                                            value={affiliateSettings.commissionType}
                                            onValueChange={(v) => handleAffiliateSettingChange('commissionType', v)}
                                            disabled={!canEdit}
                                        >
                                            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Percentage">Percentage</SelectItem>
                                                <SelectItem value="Fixed Amount">Fixed Amount</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input 
                                            type="number" 
                                            value={affiliateSettings.commissionRate}
                                            onChange={(e) => handleAffiliateSettingChange('commissionRate', Number(e.target.value))}
                                            disabled={!canEdit}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cookieDuration">Cookie Duration</Label>
                                    <Select
                                        value={String(affiliateSettings.cookieDuration)}
                                        onValueChange={(v) => handleAffiliateSettingChange('cookieDuration', Number(v))}
                                        disabled={!canEdit}
                                    >
                                        <SelectTrigger id="cookieDuration"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7">7 Days</SelectItem>
                                            <SelectItem value="30">30 Days (Recommended)</SelectItem>
                                            <SelectItem value="60">60 Days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Payout Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="payoutThreshold">Minimum Payout Threshold ({settings?.currency})</Label>
                                    <Input 
                                        id="payoutThreshold" 
                                        type="number"
                                        value={affiliateSettings.payoutThreshold}
                                        onChange={(e) => handleAffiliateSettingChange('payoutThreshold', Number(e.target.value))}
                                        disabled={!canEdit}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inventory" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                    <CardDescription>
                        Manage global settings for stock and inventory tracking.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <Label htmlFor="enableLowStockAlerts" className="flex flex-col space-y-1">
                                <span>Enable Low Stock Alerts</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Receive notifications when inventory drops below a defined threshold.
                                </span>
                            </Label>
                            <Switch id="enableLowStockAlerts" checked={settings?.inventory?.enableLowStockAlerts} onCheckedChange={(c) => handleSwitchChange('enableLowStockAlerts', c)} disabled={!canEdit} />
                        </CardHeader>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="security" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                        Manage security settings for your account and staff.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between pb-4">
                             <Label htmlFor="twoFactor" className="flex flex-col space-y-1">
                                <span>Two-Factor Authentication (2FA)</span>
                                <span className="font-normal leading-snug text-muted-foreground">
                                    Add an extra layer of security to your account.
                                </span>
                            </Label>
                             <Button variant="outline" disabled={!canEdit}>Enable 2FA</Button>
                        </CardHeader>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      {canEdit && (
        <div className="mt-8 flex justify-end">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      )}
    </>
  );
}

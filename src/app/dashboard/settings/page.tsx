

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
import type { Location, ShippingZone } from '@/lib/types';
import { getLocations as fetchLocations } from '@/services/locations';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCountryList } from '@/services/countries';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default function SettingsPage() {
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
    const [activeTab, setActiveTab] = useState('store');
    const [countryList, setCountryList] = useState<{name: string, code: string}[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
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

    const handleSelectChange = (id: 'currency', value: string) => {
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
    
    const handleDeliveryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        const { id, value } = e.target;
        setSettings(prev => prev ? { ...prev, delivery: { ...prev.delivery, [id]: value } } : null);
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

    const handleSaveChanges = () => {
        if (settings) {
            localStorage.setItem('onboardingData', JSON.stringify(settings));
        }
        toast({
            title: 'Settings Saved',
            description: 'Your changes have been saved successfully.',
        });
    }

  return (
    <>
      <div className="space-y-2 mb-8">
        <Breadcrumbs items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Settings', href: '/dashboard/settings' }
        ]} />
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store's settings, locations, payment methods, and delivery options.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Details</CardTitle>
              <CardDescription>
                Update your store's name, description, and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" value={settings?.businessName || ''} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center">
                    <Input id="subdomain" value={settings?.subdomain || ''} onChange={handleInputChange} />
                    <span className="ml-2 text-muted-foreground">.paynze.app</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Store Currency</Label>
                <Select value={settings?.currency || 'UGX'} onValueChange={(v) => handleSelectChange('currency', v)}>
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
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea id="storeDescription" placeholder="A brief description of your store." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations">
            <LocationsTab locations={locations} setLocations={setLocations} />
        </TabsContent>
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
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
                  <Switch id="cod" checked={settings?.paymentOptions.cod} onCheckedChange={(c) => handleSwitchChange('cod', c)} />
                </CardHeader>
              </Card>
               <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                     <Label htmlFor="mobileMoney" className="flex flex-col space-y-1">
                        <span>Mobile Money</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Accept payments via M-Pesa, MTN, Airtel etc.
                        </span>
                     </Label>
                     <Switch id="mobileMoney" checked={settings?.paymentOptions.mobileMoney} onCheckedChange={(c) => handleSwitchChange('mobileMoney', c)} />
                  </div>
                </CardHeader>
                <CardContent className={!settings?.paymentOptions.mobileMoney ? 'hidden' : ''}>
                    <Label htmlFor="mpesaTill">M-Pesa Till Number (Optional)</Label>
                    <Input id="mpesaTill" placeholder="e.g. 123456" />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="delivery">
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
                        <CardTitle>Shipping Zones</CardTitle>
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
                                    />
                                    <Select value={zone.countries[0]} onValueChange={(v) => handleZoneChange(zone.id, 'countries', [v])}>
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
                                  <Button variant="ghost" size="icon" onClick={() => handleRemoveZone(zone.id)}>
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
                                    />
                               </CardContent>
                           </Card>
                        ))}
                         <Button variant="outline" onClick={handleAddZone}>
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Shipping Zone
                         </Button>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="inventory">
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
                            <Switch id="enableLowStockAlerts" checked={settings?.inventory?.enableLowStockAlerts} onCheckedChange={(c) => handleSwitchChange('enableLowStockAlerts', c)} />
                        </CardHeader>
                    </Card>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      <div className="mt-8 flex justify-end">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </>
  );
}

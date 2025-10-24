
'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { OnboardingFormData } from '@/context/onboarding-context';
import { LocationsTab } from '@/components/settings/locations-tab';
import type { Location } from '@/lib/types';
import { getLocations as fetchLocations } from '@/services/locations';


export default function SettingsPage() {
    const [settings, setSettings] = useState<OnboardingFormData | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            setSettings(JSON.parse(data));
        }
        async function loadLocations() {
            const fetchedLocations = await fetchLocations();
            setLocations(fetchedLocations);
        }
        loadLocations();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        const { id, value } = e.target;
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

  return (
    <>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store's settings, locations, payment methods, and delivery options.
        </p>
      </div>
      <Tabs defaultValue="store" className="w-full">
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
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Pickup</CardTitle>
              <CardDescription>
                Set up your shipping rates and pickup locations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <Label htmlFor="pickup" className="flex flex-col space-y-1">
                    <span>In-Store Pickup</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Allow customers to pick up their orders from your location.
                    </span>
                  </Label>
                  <Switch id="pickup" checked={settings?.delivery.pickup} onCheckedChange={(c) => handleSwitchChange('pickup', c)} />
                </CardHeader>
                <CardContent className={!settings?.delivery.pickup ? 'hidden' : ''}>
                  <Label htmlFor="address">Pickup Address</Label>
                  <Input id="address" value={settings?.delivery.address || ''} onChange={handleDeliveryInputChange} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="flat-rate" className="flex flex-col space-y-1">
                            <span>Flat Rate Shipping</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Charge a single rate for all deliveries.
                            </span>
                        </Label>
                        <Switch id="flat-rate" defaultChecked={!!settings?.delivery.deliveryFee} />
                    </div>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="deliveryFee">Flat Rate Fee ({settings?.currency || '...'})</Label>
                    <Input id="deliveryFee" type="number" value={settings?.delivery.deliveryFee || ''} onChange={handleDeliveryInputChange} />
                </CardContent>
              </Card>
            </CardContent>
          </Card>
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
        <Button>Save Changes</Button>
      </div>
    </>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function SettingsPage() {
  return (
    <>
      <div className="space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store's settings, payment methods, and delivery options.
        </p>
      </div>
      <Tabs defaultValue="store" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
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
                <Input id="businessName" defaultValue="Kato's Wholesalers" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center">
                    <Input id="subdomain" defaultValue="katos" />
                    <span className="ml-2 text-muted-foreground">.africommerce.app</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea id="storeDescription" defaultValue="The best wholesale prices in Kampala." />
              </div>
            </CardContent>
          </Card>
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
                  <Switch id="cod" defaultChecked />
                </CardHeader>
              </Card>
               <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                     <Label htmlFor="mpesa" className="flex flex-col space-y-1">
                        <span>M-Pesa</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Accept payments via M-Pesa.
                        </span>
                     </Label>
                     <Switch id="mpesa" defaultChecked />
                  </div>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="mpesaTill">M-Pesa Till Number</Label>
                    <Input id="mpesaTill" defaultValue="123456" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="mtn" className="flex flex-col space-y-1">
                            <span>MTN Mobile Money</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Accept payments via MTN MoMo.
                            </span>
                        </Label>
                        <Switch id="mtn" />
                    </div>
                </CardHeader>
                <CardContent className="hidden">
                    <Label htmlFor="mtnCode">MTN Merchant Code</Label>
                    <Input id="mtnCode" placeholder="Enter your MTN Merchant Code" />
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
                  <Switch id="pickup" defaultChecked />
                </CardHeader>
                <CardContent>
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <Input id="pickupAddress" defaultValue="Shop 14, Kikuubo Lane, Kampala" />
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
                        <Switch id="flat-rate" defaultChecked />
                    </div>
                </CardHeader>
                <CardContent>
                    <Label htmlFor="flatRateFee">Flat Rate Fee (UGX)</Label>
                    <Input id="flatRateFee" type="number" defaultValue="10000" />
                </CardContent>
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

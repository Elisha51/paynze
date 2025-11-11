
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Order, PaymentDetails, OnboardingFormData, ShippingZone, DeliveryMethod } from '@/lib/types';
import { addOrder } from '@/services/orders';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCountryList } from '@/services/countries';
import { getShippingZones } from '@/services/shipping';

async function simulatePaymentWebhook(orderId: string, status: 'SUCCESS' | 'FAILED') {
    await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
    });
}

export default function CheckoutPage() {
  const { cartItems, cartTotal, currency, clearCart } = useCart();
  const router = useRouter();
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [shippingInfo, setShippingInfo] = useState({ street: '', city: '', country: 'Uganda' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['method']>('Cash on Delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [countryCode, setCountryCode] = useState('+256');
  
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<DeliveryMethod | null>(null);

  useEffect(() => {
    async function loadInitialData() {
        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedSettings: OnboardingFormData = JSON.parse(data);
            setSettings(parsedSettings);
            setShippingInfo(prev => ({...prev, country: parsedSettings.country || 'Uganda'}));
        }
        const [countryList, zones] = await Promise.all([
            getCountryList(),
            getShippingZones()
        ]);
        setCountries(countryList);
        setShippingZones(zones);
    }
    loadInitialData();
  }, []);
  
  const { availableShippingMethods, taxAmount, shippingFee, total } = useMemo(() => {
    const applicableZone = shippingZones.find(zone => zone.countries.includes(shippingInfo.country));
    const methods = applicableZone?.deliveryMethods || [];
    
    // Set default shipping method if not already set or invalid
    if (methods.length > 0 && (!selectedShippingMethod || !methods.find(m => m.id === selectedShippingMethod.id))) {
        setSelectedShippingMethod(methods[0]);
    } else if (methods.length === 0 && selectedShippingMethod) {
        setSelectedShippingMethod(null);
    }
    
    const fee = selectedShippingMethod?.price || 0;
    const taxRate = (settings?.taxRate || 0) / 100;
    const taxableAmount = cartItems.filter(item => item.isTaxable).reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = taxableAmount * taxRate;
    
    const finalTotal = cartTotal + fee + tax;
    
    return {
        availableShippingMethods: methods,
        taxAmount: tax,
        shippingFee: fee,
        total: finalTotal,
    };
  }, [shippingZones, shippingInfo.country, cartItems, cartTotal, settings, selectedShippingMethod]);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
        const orderData: Omit<Order, 'id'> = {
            customerId: `cust-${Date.now()}`, // Temporary customer ID
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            customerPhone: `${countryCode}${customerInfo.phone}`,
            date: new Date().toISOString(),
            status: 'Awaiting Payment' as const,
            fulfillmentMethod: selectedShippingMethod?.type === 'Pickup' ? 'Pickup' : 'Delivery',
            channel: 'Online' as const,
            items: cartItems.map(({ productId, variantId, image, isTaxable, ...rest }) => rest), // Remove client-side fields
            total: total,
            currency: currency,
            shippingAddress: { ...shippingInfo, postalCode: '00000' },
            payment: {
                method: paymentMethod,
                status: 'pending' as const,
            },
            shippingCost: shippingFee,
            taxes: taxAmount,
        };
        
        const newOrder = await addOrder(orderData);
        
        toast({
            title: 'Order Placed!',
            description: 'Your order has been successfully placed. Please complete payment if required.',
        });

        if (paymentMethod === 'Mobile Money') {
            // Simulate payment processing after a short delay
            setTimeout(() => {
                // In a real app, this would be handled by the payment provider's webhook
                // Here we simulate a successful payment for demonstration
                simulatePaymentWebhook(newOrder.id, 'SUCCESS');
                 toast({
                    title: 'Payment Successful',
                    description: `Payment for order #${newOrder.id} has been confirmed.`,
                });
            }, 5000);
        }

        clearCart();
        router.push('/store'); // Redirect to a success page or back to store
    } catch(error) {
        console.error("Failed to place order:", error);
        toast({
            variant: 'destructive',
            title: 'Order Failed',
            description: 'There was an issue placing your order. Please try again.',
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  if (cartItems.length === 0 && !isLoading) {
      return (
          <div className="container py-12 text-center">
              <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
              <p className="text-muted-foreground mt-2">Add some products to your cart to proceed to checkout.</p>
              <Button onClick={() => router.push('/store')} className="mt-4">Continue Shopping</Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <Link href="/store"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={customerInfo.name} onChange={(e) => setCustomerInfo(p => ({...p, name: e.target.value}))} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo(p => ({...p, email: e.target.value}))} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="flex items-center gap-2">
                                    <Select value={countryCode} onValueChange={setCountryCode}>
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Code" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {countries.map(c => <SelectItem key={c.code} value={c.dialCode}>{c.code} ({c.dialCode})</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                    <Input id="phone" type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo(p => ({...p, phone: e.target.value}))} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping & Delivery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input id="street" value={shippingInfo.street} onChange={(e) => setShippingInfo(p => ({...p, street: e.target.value}))} />
                        </div>
                         <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={shippingInfo.city} onChange={(e) => setShippingInfo(p => ({...p, city: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                 <Select value={shippingInfo.country} onValueChange={(v) => setShippingInfo(p => ({...p, country: v}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {availableShippingMethods.length > 0 && (
                            <div className="space-y-2 pt-4">
                                <Label>Delivery Method</Label>
                                <RadioGroup value={selectedShippingMethod?.id} onValueChange={(id) => setSelectedShippingMethod(availableShippingMethods.find(m => m.id === id) || null)} className="space-y-2">
                                    {availableShippingMethods.map(method => (
                                         <Label key={method.id} htmlFor={`ship-${method.id}`} className="flex justify-between items-center border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value={method.id} id={`ship-${method.id}`} />
                                                <div className="flex flex-col">
                                                    <span>{method.name}</span>
                                                    <span className="text-xs text-muted-foreground">{method.description}</span>
                                                </div>
                                            </div>
                                            <span className="font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(method.price)}</span>
                                        </Label>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cartItems.map(item => (
                            <div key={item.variantId} className="flex justify-between items-center text-sm">
                                <p>{item.name} <span className="text-muted-foreground">x {item.quantity}</span></p>
                                <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(item.price * item.quantity)}</p>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center text-sm">
                            <p className="text-muted-foreground">Subtotal</p>
                            <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cartTotal)}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <p className="text-muted-foreground">Shipping</p>
                            <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(shippingFee)}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <p className="text-muted-foreground">Taxes</p>
                            <p className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(taxAmount)}</p>
                        </div>
                        <Separator />
                         <div className="flex justify-between items-center font-bold text-lg">
                            <p>Total</p>
                            <p>{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(total)}</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="space-y-2">
                            {settings?.paymentOptions.cod && (
                                <Label htmlFor="cod" className="flex items-center gap-3 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                                    <RadioGroupItem value="Cash on Delivery" id="cod" />
                                    <span>Cash on Delivery</span>
                                </Label>
                            )}
                             {settings?.paymentOptions.mobileMoney && (
                                <Label htmlFor="mobile-money" className="flex items-center gap-3 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                                    <RadioGroupItem value="Mobile Money" id="mobile-money" />
                                     <span>Mobile Money</span>
                                </Label>
                             )}
                        </RadioGroup>
                         {paymentMethod === 'Mobile Money' && (
                            <Alert variant="default" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Pay with Mobile Money</AlertTitle>
                                <AlertDescription>
                                    After placing your order, a payment prompt will be sent to your phone to complete the purchase.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
                <Button size="lg" className="w-full" onClick={handlePlaceOrder} disabled={isLoading}>
                    {isLoading ? 'Placing Order...' : 'Place Order'}
                </Button>
            </div>
        </div>
    </div>
  );
}

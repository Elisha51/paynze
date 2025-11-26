
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Order, PaymentDetails, OnboardingFormData, ShippingZone, DeliveryMethod, Customer } from '@/lib/types';
import { addOrder } from '@/services/orders';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCountryList } from '@/services/countries';
import { getShippingZones } from '@/services/shipping';
import { Checkbox } from '@/components/ui/checkbox';
import { addCustomer, getCustomerById } from '@/services/customers';

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
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Partial<Customer> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['method']>('Cash on Delivery');
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<{name: string, code: string, dialCode: string}[]>([]);
  const [countryCode, setCountryCode] = useState('+256');
  
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<DeliveryMethod | null>(null);
  const [createAccount, setCreateAccount] = useState(false);
  const isLoggedIn = !!customer;

  useEffect(() => {
    async function loadInitialData() {
        const loggedInCustomerId = localStorage.getItem('loggedInCustomerId');
        if (loggedInCustomerId) {
            const custData = await getCustomerById(loggedInCustomerId);
            if (custData) {
                setCustomer(custData);
            }
        }

        const data = localStorage.getItem('onboardingData');
        if (data) {
            const parsedSettings: OnboardingFormData = JSON.parse(data);
            setSettings(parsedSettings);
        }
        const [countryList, zones] = await Promise.all([
            getCountryList(),
            getShippingZones()
        ]);
        setCountries(countryList);
        setShippingZones(zones);
    }
    loadInitialData();
  }, [router]);
  
  const { availableShippingMethods, taxAmount, shippingFee, total } = useMemo(() => {
    const shippingCountry = customer?.shippingAddress?.country || 'Uganda';
    const applicableZone = shippingZones.find(zone => zone.countries.includes(shippingCountry));
    const methods = applicableZone?.deliveryMethods || [];
    
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
  }, [shippingZones, customer, cartItems, cartTotal, settings, selectedShippingMethod]);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomer(p => p ? {...p, [id]: value } : { [id]: value });
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setCustomer(p => ({ ...p, shippingAddress: { ...p?.shippingAddress, [id]: value } as any }));
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);

    let currentCustomer = customer;
    if (!isLoggedIn && createAccount && customer?.email && customer.name) {
        try {
            currentCustomer = await addCustomer({
                name: customer.name,
                email: customer.email,
                phone: `${countryCode}${customer.phone}`,
                customerGroup: 'default',
                lastOrderDate: '',
                totalSpend: 0,
                currency: currency,
            });
            localStorage.setItem('isCustomerLoggedIn', 'true');
            localStorage.setItem('loggedInCustomerId', currentCustomer.id);
        } catch(e) {
            toast({ variant: 'destructive', title: 'Could not create account.' });
            setIsLoading(false);
            return;
        }
    }

    if (!currentCustomer?.name || !currentCustomer.email) {
        toast({ variant: 'destructive', title: 'Please enter customer information.' });
        setIsLoading(false);
        return;
    }


    try {
        const orderData: Omit<Order, 'id'> = {
            customerId: currentCustomer.id || `cust-${Date.now()}`,
            customerName: currentCustomer.name,
            customerEmail: currentCustomer.email,
            customerPhone: `${countryCode}${currentCustomer.phone}`,
            date: new Date().toISOString(),
            status: 'Awaiting Payment' as const,
            fulfillmentMethod: selectedShippingMethod?.type === 'Pickup' ? 'Pickup' : 'Delivery',
            channel: 'Online' as const,
            items: cartItems.map(({ productId, variantId, image, isTaxable, ...rest }) => rest), // Remove client-side fields
            total: total,
            currency: currency,
            shippingAddress: { ...customer.shippingAddress, postalCode: '00000' } as any,
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
            setTimeout(() => {
                simulatePaymentWebhook(newOrder.id, 'SUCCESS');
                 toast({
                    title: 'Payment Successful',
                    description: `Payment for order #${newOrder.id} has been confirmed.`,
                });
            }, 5000);
        }

        clearCart();
        router.push('/store');
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
                         {!isLoggedIn && (
                            <CardDescription>
                                Already have an account? <Button asChild variant="link" className="p-0 h-auto"><Link href="/store/login?redirect=/checkout">Log in</Link></Button>
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={customer?.name || ''} onChange={handleCustomerChange} placeholder="e.g. Jane Doe"/>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                           <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" value={customer?.email || ''} onChange={handleCustomerChange} placeholder="e.g. jane@example.com"/>
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
                                    <Input id="phone" type="tel" value={customer?.phone || ''} onChange={handleCustomerChange} placeholder="772123456"/>
                                </div>
                            </div>
                        </div>
                         {!isLoggedIn && (
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="createAccount" checked={createAccount} onCheckedChange={(checked) => setCreateAccount(checked as boolean)} />
                                <Label htmlFor="createAccount" className="text-sm font-normal">
                                Create an account to save your information for next time
                                </Label>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping & Delivery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="street">Street Address</Label>
                            <Input id="street" value={customer?.shippingAddress?.street || ''} onChange={handleAddressChange} placeholder="e.g. 123 Makerere Hill Rd"/>
                        </div>
                         <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" value={customer?.shippingAddress?.city || ''} onChange={handleAddressChange} placeholder="e.g. Kampala"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                 <Select value={customer?.shippingAddress?.country || 'Uganda'} onValueChange={(v) => setCustomer(p => ({...p, shippingAddress: { ...p?.shippingAddress, country: v } as any}))}>
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

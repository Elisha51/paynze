
'use client';
import { useState, useMemo } from 'react';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PaymentDetails, OnboardingFormData } from '@/lib/types';
import { addOrder } from '@/services/orders';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CheckoutPage() {
  const { cartItems, cartTotal, currency, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [shippingInfo, setShippingInfo] = useState({ street: '', city: '', country: 'Uganda' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentDetails['method']>('Cash on Delivery');
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<OnboardingFormData | null>(null);

  useState(() => {
    const data = localStorage.getItem('onboardingData');
    if (data) {
        setSettings(JSON.parse(data));
    }
  });
  
  const shippingFee = Number(settings?.delivery.deliveryFee) || 0;
  const total = cartTotal + shippingFee;

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
        const orderData = {
            customerId: `cust-${Date.now()}`, // Temporary customer ID
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            date: new Date().toISOString(),
            status: 'Awaiting Payment' as const,
            fulfillmentMethod: 'Delivery' as const,
            channel: 'Online' as const,
            items: cartItems.map(({ productId, variantId, image, ...rest }) => rest), // Remove client-side fields
            total: total,
            currency: currency,
            shippingAddress: { ...shippingInfo, postalCode: '00000' },
            payment: {
                method: paymentMethod,
                status: 'pending' as const,
            },
            shippingCost: shippingFee,
        };
        
        await addOrder(orderData);
        
        toast({
            title: 'Order Placed!',
            description: 'Your order has been successfully placed.',
        });
        clearCart();
        router.push('/'); // Redirect to a success page or back to store
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
              <Button onClick={() => router.push('/')} className="mt-4">Continue Shopping</Button>
          </div>
      )
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
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
                                <Input id="phone" type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo(p => ({...p, phone: e.target.value}))} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Address</CardTitle>
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
                                <Input id="country" value={shippingInfo.country} onChange={(e) => setShippingInfo(p => ({...p, country: e.target.value}))} />
                            </div>
                        </div>
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

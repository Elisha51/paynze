
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type DeliveryType = {
  type: 'Pickup' | 'Flat Rate' | 'Local Courier';
  enabled: boolean;
  cost?: number;
  regions?: string[];
  description: string;
};

const mockDeliveryTypes: DeliveryType[] = [
  { type: 'Pickup', enabled: true, description: "Customer collects from the store." },
  { type: 'Flat Rate', enabled: true, cost: 10000, description: "Fixed delivery fee for all locations." },
  { type: 'Local Courier', enabled: false, cost: 5000, description: "For Boda-boda or other local couriers." },
];

export function DeliveryManagement() {
  const [deliveryTypes, setDeliveryTypes] = useState(mockDeliveryTypes);
  const [editingType, setEditingType] = useState<DeliveryType | null>(null);
  const { toast } = useToast();
  
  const handleToggle = (type: DeliveryType['type']) => {
    setDeliveryTypes(prev =>
      prev.map(dt =>
        dt.type === type ? { ...dt, enabled: !dt.enabled } : dt
      )
    );
  };
  
  const handleCostChange = (type: DeliveryType['type'], newCost: number) => {
    setDeliveryTypes(prev =>
      prev.map(dt =>
        dt.type === type ? { ...dt, cost: newCost } : dt
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Management</CardTitle>
        <CardDescription>Configure how your customers receive their orders.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {deliveryTypes.map(dt => (
          <div key={dt.type} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-4">
                <Switch
                    checked={dt.enabled}
                    onCheckedChange={() => handleToggle(dt.type)}
                />
                <div>
                    <Label className="font-semibold">{dt.type}</Label>
                    <p className="text-xs text-muted-foreground">{dt.description}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {dt.cost !== undefined && (
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">UGX</span>
                        <Input
                            type="number"
                            value={dt.cost}
                            onChange={(e) => handleCostChange(dt.type, Number(e.target.value))}
                            className="w-32 pl-10 h-9"
                            disabled={!dt.enabled}
                        />
                    </div>
                )}
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

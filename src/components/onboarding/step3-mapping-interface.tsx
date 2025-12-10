
'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ArrowRight, Info } from 'lucide-react';

interface Step3MappingInterfaceProps {
    file: File;
    onMappingComplete: () => void;
}

// Mocked headers from a sample CSV
const mockCsvHeaders = ['Item Name', 'Description', 'Price', 'SKU', 'Stock'];

// System's required fields
const systemFields = [
    { value: 'name', label: 'Product Name' },
    { value: 'description', label: 'Description' },
    { value: 'price', label: 'Price' },
    { value: 'sku', label: 'SKU' },
    { value: 'stock', label: 'Stock Quantity' },
    { value: 'category', label: 'Category' },
    { value: 'ignore', label: 'Ignore this column' },
];

export function Step3MappingInterface({ file, onMappingComplete }: Step3MappingInterfaceProps) {
    const [mapping, setMapping] = useState<Record<string, string>>({});

    const handleMappingChange = (csvHeader: string, systemField: string) => {
        setMapping(prev => ({...prev, [csvHeader]: systemField }));
    };

    const isMappingComplete = mockCsvHeaders.length === Object.keys(mapping).length;

    return (
        <div className="space-y-4">
             <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Map Your Columns</AlertTitle>
                <AlertDescription>
                    Match the columns from your uploaded file to the corresponding fields in our system.
                </AlertDescription>
            </Alert>
            <Card>
                <CardContent className="p-4 space-y-3">
                    {mockCsvHeaders.map(header => (
                        <div key={header} className="grid grid-cols-2 gap-4 items-center">
                            <div className="p-2 bg-muted rounded-md text-sm truncate">
                                <span className="font-semibold">Column from your file:</span>
                                <p className="text-muted-foreground">{header}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <Select onValueChange={(value) => handleMappingChange(header, value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a system field..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {systemFields.map(field => (
                                            <SelectItem key={field.value} value={field.value}>
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button onClick={onMappingComplete} disabled={!isMappingComplete}>
                    Confirm Mapping & Continue
                </Button>
            </div>
        </div>
    );
}

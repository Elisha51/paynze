

'use client';
import { ProductTemplateForm } from '@/components/dashboard/product-template-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AddProductTemplatePage() {
    const { user } = useAuth();
    const router = useRouter();
    const canEditProducts = user?.permissions.products.edit;

    if (!canEditProducts) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You do not have permission to create product templates.</p>
                     <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return <ProductTemplateForm />;
}

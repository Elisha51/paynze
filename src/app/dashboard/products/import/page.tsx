
'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Upload, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { FileUploader } from '@/components/ui/file-uploader';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function ImportProductsPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState<File[]>([]);
    const { toast } = useToast();

    const steps = [
        { label: 'Download Template' },
        { label: 'Upload File' },
        { label: 'Review & Import' },
    ];

    const handleFileChange = (files: File[]) => {
        if (files.length > 0) {
            setUploadedFile(files);
            setCurrentStep(3); // Move to the review step
        } else {
            setUploadedFile([]);
            setCurrentStep(2);
        }
    };
    
    const handleImport = () => {
        if (uploadedFile.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No file selected',
                description: 'Please upload a CSV file to import.',
            });
            return;
        }

        // Basic CSV parsing simulation
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',');
            const productCount = lines.length > 1 ? lines.length - 1 : 0; // Exclude header row

            console.log('Parsed Headers:', headers);
            console.log(`Simulating import of ${productCount} products.`);
            
            toast({
                title: 'Import Successful',
                description: `${productCount} products have been successfully imported.`,
            });
        };
        reader.readAsText(uploadedFile[0]);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/products">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Products</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Import Products</h1>
                    <p className="text-muted-foreground">Bulk add new products to your store using a CSV file.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto my-8">
                <Stepper currentStep={currentStep - 1} steps={steps} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Download Template</CardTitle>
                    <CardDescription>
                        Start by downloading the CSV template. This file contains the correct headers needed to import your products.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Button asChild variant={currentStep === 1 ? 'default' : 'outline'}>
                            <a href="/products-template.csv" download>
                                <Download className="mr-2 h-4 w-4" />
                                Download CSV Template
                            </a>
                        </Button>
                        <Button variant="link" onClick={() => setCurrentStep(2)} className={currentStep === 1 ? 'ml-4' : 'hidden'}>
                            I have my file ready
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className={currentStep >= 2 ? 'block' : 'hidden'}>
                <CardHeader>
                    <CardTitle>Step 2: Upload Your CSV File</CardTitle>
                    <CardDescription>
                        Drag and drop your completed CSV file here or click to browse.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUploader
                        files={uploadedFile}
                        onFilesChange={handleFileChange}
                        maxFiles={1}
                        accept={{ 'text/csv': ['.csv'] }}
                    />
                </CardContent>
            </Card>

            <Card className={currentStep === 3 ? 'block' : 'hidden'}>
                <CardHeader>
                    <CardTitle>Step 3: Review and Import</CardTitle>
                    <CardDescription>
                        Review your file and confirm to start the import process.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {uploadedFile.length > 0 ? (
                        <div className="flex items-center gap-2 p-4 rounded-md bg-muted">
                            <FileCheck2 className="h-6 w-6 text-green-600" />
                            <p className="font-medium">{uploadedFile[0].name}</p>
                            <p className="text-sm text-muted-foreground">({Math.round(uploadedFile[0].size / 1024)} KB)</p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Please upload a file in the step above to review it here.</p>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleImport} disabled={currentStep !== 3}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Products
                </Button>
            </div>
        </div>
    );
}

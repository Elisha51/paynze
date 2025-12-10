
'use client';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileUploader } from '../ui/file-uploader';
import { Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Step3MappingInterface } from './step3-mapping-interface';

const csvTemplate = `name,description,price,sku,stock,category
"Classic T-Shirt","A comfortable 100% cotton t-shirt.","35000","TSHIRT-BLK-M","50","Apparel"
"Handmade Leather Wallet","A durable wallet made from genuine leather.","75000","WALLET-LTHR-BRN","25","Accessories"
`;

export default function Step3CatalogUpload() {
  const { nextStep, prevStep } = useOnboarding();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSkip = () => {
    nextStep();
  };

  const handleFilesChange = (files: File[]) => {
    setUploadedFiles(files);
  };

  const onMappingComplete = () => {
    // This will eventually trigger the import process
    nextStep();
  };
  
  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "product_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Upload Your Product Catalog</CardTitle>
        <CardDescription>
          {uploadedFiles.length === 0 
            ? "Save time by uploading your products using a CSV file. You can also skip this and add products manually later."
            : "Match your file's columns to the required product fields."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 min-h-[250px]">
        {uploadedFiles.length === 0 ? (
            <>
                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertTitle>Download Template</AlertTitle>
                  <AlertDescription>
                    For best results, download our CSV template to ensure your file is formatted correctly.
                    <Button variant="link" onClick={handleDownloadTemplate} className="p-0 h-auto ml-1 font-semibold">Download Template</Button>
                  </AlertDescription>
                </Alert>
                <FileUploader 
                    files={uploadedFiles}
                    onFilesChange={handleFilesChange}
                    maxFiles={1}
                    accept={{ 'text/csv': ['.csv'] }}
                />
            </>
        ) : (
            <Step3MappingInterface file={uploadedFiles[0]} onMappingComplete={onMappingComplete} />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={uploadedFiles.length > 0}>Back</Button>
        {uploadedFiles.length === 0 && (
            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleSkip}>Skip for Now</Button>
                <Button onClick={nextStep} disabled>Continue</Button>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

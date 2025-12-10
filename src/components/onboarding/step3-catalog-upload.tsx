
'use client';
import { useState } from 'react';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileUploader } from '../ui/file-uploader';
import { Download, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Step3MappingInterface } from './step3-mapping-interface';

const csvTemplate = `name,description,price,sku,stock,category,compareAtPrice,costPerItem,isTaxable,tags,imageUrl,hasVariants,option1_name,option1_value,option2_name,option2_value
"Classic T-Shirt","A comfortable 100% cotton t-shirt.","35000","TSHIRT-BLK-M","50","Apparel","40000","20000","TRUE","tshirt, casual, cotton","https://picsum.photos/seed/tshirt/400/400",TRUE,"Size","M","Color","Black"
"Classic T-Shirt","A comfortable 100% cotton t-shirt.","35000","TSHIRT-BLK-L","30","Apparel","40000","20000","TRUE","tshirt, casual, cotton","https://picsum.photos/seed/tshirt/400/400",TRUE,"Size","L","Color","Black"
"Handmade Wallet","A durable wallet made from genuine leather.","75000","WALLET-LTHR-BRN","25","Accessories","","50000","FALSE","leather, wallet, handmade","https://picsum.photos/seed/wallet/400/400",FALSE,"","","",""
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
                  <AlertTitle>Download our CSV template</AlertTitle>
                  <AlertDescription>
                    For best results, download our CSV template to ensure your file is formatted correctly. 
                    <Button variant="link" onClick={handleDownloadTemplate} className="p-0 h-auto ml-1 font-semibold">Download Template</Button>
                  </AlertDescription>
                </Alert>
                 <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-700" />
                    <AlertTitle className="text-blue-800">How to Add Images</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        In the <code className="font-semibold bg-blue-100 px-1 rounded">imageUrl</code> column, paste a public URL for each product image. You can host your images on a site like Dropbox, Imgur, or your own web storage. You can add more images later.
                    </AlertDescription>
                </Alert>
                <FileUploader 
                    files={uploadedFiles}
                    onFilesChange={handleFilesChange}
                    maxFiles={1}
                    accept={{ 'text/csv': ['.csv'] }}
                />
                 <p className="text-sm text-muted-foreground">Required fields are <code className="bg-muted px-1 py-0.5 rounded">name</code> and <code className="bg-muted px-1 py-0.5 rounded">price</code>. All other fields are optional.</p>
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

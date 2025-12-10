
'use client';
import { useOnboarding } from '@/context/onboarding-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileUploader } from '../ui/file-uploader';
import { Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function Step3CatalogUpload() {
  const { nextStep, prevStep } = useOnboarding();

  const handleSkip = () => {
    // We can add logic here later to handle skipping
    nextStep();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Upload Your Product Catalog</CardTitle>
        <CardDescription>
          Save time by uploading your products using a CSV file. You can also skip this and add products manually later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Download className="h-4 w-4" />
          <AlertTitle>Download Template</AlertTitle>
          <AlertDescription>
            For best results, download our CSV template to ensure your file is formatted correctly.
            <Button variant="link" className="p-0 h-auto ml-1 font-semibold">Download Template</Button>
          </AlertDescription>
        </Alert>
        <FileUploader 
            files={[]}
            onFilesChange={(files) => console.log(files)} // Placeholder for upload logic
            maxFiles={1}
            accept={{ 'text/csv': ['.csv'] }}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>Back</Button>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleSkip}>Skip for Now</Button>
            <Button onClick={nextStep}>Continue</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

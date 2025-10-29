'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <WifiOff className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">You are currently offline</h1>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        It looks like you've lost your connection. Please check it and try again. Some previously visited pages might still be available.
      </p>
      <Button onClick={() => router.push('/dashboard')}>
        Go to Dashboard
      </Button>
    </div>
  );
}

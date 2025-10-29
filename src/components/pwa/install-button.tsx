
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    // This check is to prevent the button from showing if the app is already installed.
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };
  
  if (!installPrompt) {
      return null;
  }

  return (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    >
        <Button onClick={handleInstallClick} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Install App
        </Button>
    </motion.div>
  );
}

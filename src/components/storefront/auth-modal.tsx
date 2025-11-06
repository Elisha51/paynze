
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function AuthModal({ isOpen, onClose, reason }: AuthModalProps) {
  const description = reason 
    ? `You need to be logged in to ${reason}.`
    : 'You need to be logged in to your account to perform this action.';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
            <div className="p-3 rounded-full bg-primary/10 w-fit">
                <Lock className="h-6 w-6 text-primary" />
            </div>
          <DialogTitle>Please Sign In</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button asChild size="lg">
            <Link href="/store/login">Sign In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/store/signup">Create an Account</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

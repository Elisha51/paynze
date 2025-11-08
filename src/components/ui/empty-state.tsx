
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: React.ReactNode;
}

export function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-4 py-12 px-6">
        <div className="bg-primary/10 p-4 rounded-full">
            {icon}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">{description}</p>
        {cta && <div className="mt-4">{cta}</div>}
    </div>
  );
}

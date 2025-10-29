
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const router = useRouter();

  const handleNavigation = (href: string) => {
    router.push(href);
  };
  
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <li>
              {index < items.length - 1 ? (
                <Button 
                  variant="link" 
                  onClick={() => handleNavigation(item.href)} 
                  className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Button>
              ) : (
                <span className="font-medium text-foreground">{item.label}</span>
              )}
            </li>
            {index < items.length - 1 && (
              <li>
                <ChevronRight className="h-4 w-4" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

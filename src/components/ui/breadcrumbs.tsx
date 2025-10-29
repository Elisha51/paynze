
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm text-muted-foreground', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            <li>
              {index < items.length - 1 ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
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

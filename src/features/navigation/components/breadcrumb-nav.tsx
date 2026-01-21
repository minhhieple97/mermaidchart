'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center gap-1.5">
        <li>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

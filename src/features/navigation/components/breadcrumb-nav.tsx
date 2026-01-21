'use client';

/**
 * Breadcrumb Navigation Component
 * Shows current location: Dashboard > Project > Diagram
 * Makes breadcrumbs clickable for navigation
 *
 * Requirements:
 * - 7.3: Display breadcrumb navigation showing current location
 * - 7.4: Make breadcrumbs clickable for navigation
 */

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
      className={cn(
        'flex items-center text-sm text-muted-foreground',
        className,
      )}
    >
      <ol className="flex items-center gap-1">
        {/* Home/Dashboard link */}
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Dashboard</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate max-w-[200px]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * ResponsiveContainer Component
 * 
 * Adaptive container with breakpoint-aware spacing.
 * Follows Adaptive Convergence responsive principles.
 */

'use client';

import { ReactNode } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  density?: 'compact' | 'comfortable' | 'spacious';
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  density = 'compact',
}: ResponsiveContainerProps) {
  const breakpoint = useBreakpoint();

  // Calculate padding based on breakpoint and density
  const getPadding = () => {
    const densityMap = {
      compact: {
        mobile: 'px-4 py-4',
        sm: 'px-6 py-4',
        md: 'px-6 py-6',
        lg: 'px-8 py-6',
        xl: 'px-8 py-8',
        '2xl': 'px-12 py-8',
      },
      comfortable: {
        mobile: 'px-4 py-6',
        sm: 'px-6 py-6',
        md: 'px-8 py-8',
        lg: 'px-10 py-8',
        xl: 'px-12 py-10',
        '2xl': 'px-16 py-12',
      },
      spacious: {
        mobile: 'px-4 py-8',
        sm: 'px-8 py-8',
        md: 'px-10 py-10',
        lg: 'px-12 py-12',
        xl: 'px-16 py-16',
        '2xl': 'px-20 py-20',
      },
    };

    return densityMap[density][breakpoint];
  };

  // Max width classes
  const maxWidthMap = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'container mx-auto',
        maxWidthMap[maxWidth],
        getPadding(),
        className
      )}
    >
      {children}
    </div>
  );
}
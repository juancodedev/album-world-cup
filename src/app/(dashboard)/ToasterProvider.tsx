'use client';

import { Toaster } from 'sonner';

/**
 * Client wrapper for the sonner <Toaster /> component.
 * Required because (dashboard)/layout.tsx is a server component
 * and cannot directly render <Toaster />.
 */
export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
    />
  );
}

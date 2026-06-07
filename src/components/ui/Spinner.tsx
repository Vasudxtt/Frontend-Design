import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-primary-600', className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

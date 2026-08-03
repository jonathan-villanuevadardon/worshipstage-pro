import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoadingSpinner({ text = 'Loading...', className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-muted-foreground", className)}>
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
      {text && <p className="text-sm font-medium tracking-wide">{text}</p>}
    </div>
  );
}
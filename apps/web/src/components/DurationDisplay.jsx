import React from 'react';
import { Clock } from 'lucide-react';
import { formatDuration } from '@/lib/repertoireUtils';
import { cn } from '@/lib/utils';

export default function DurationDisplay({ seconds, className, showIcon = true }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      {showIcon && <Clock className="w-4 h-4" />}
      <span className="font-medium tabular-nums">{formatDuration(seconds)}</span>
    </div>
  );
}
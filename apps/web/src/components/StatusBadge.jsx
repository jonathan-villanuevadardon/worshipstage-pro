import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function StatusBadge({ status, className }) {
  const variants = {
    draft: 'bg-muted text-muted-foreground hover:bg-muted/80',
    published: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20',
    archived: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20',
  };

  return (
    <Badge variant="outline" className={cn("capitalize font-medium", variants[status?.toLowerCase()] || variants.draft, className)}>
      {status || 'Draft'}
    </Badge>
  );
}
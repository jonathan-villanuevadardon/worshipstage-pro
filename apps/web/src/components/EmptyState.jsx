import React from 'react';
import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border bg-card/50", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-secondary" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm mb-6">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
import React from 'react';
import { Button } from '@/components/ui/button';

export default function TranspositionPresetButtons({ currentValue, onChange }) {
  const presets = [-2, -1, 0, 1, 2];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-2">Rápido:</span>
      {presets.map(val => (
        <Button
          key={val}
          variant={currentValue === val ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(val)}
          className={`${val === 0 ? 'w-16' : 'w-10'} h-8 p-0`}
        >
          {val > 0 ? `+${val}` : val === 0 ? 'Original' : val}
        </Button>
      ))}
    </div>
  );
}

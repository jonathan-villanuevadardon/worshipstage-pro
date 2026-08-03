import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function LyricsDisplay({ lyrics, chords }) {
  const [showChords, setShowChords] = useState(false);

  if (!lyrics && !chords) return <div className="text-muted-foreground italic">No lyrics available</div>;

  return (
    <div className="space-y-4">
      {chords && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <Label htmlFor="show-chords" className="text-sm text-muted-foreground">Show Chords Overlay</Label>
          <Switch id="show-chords" checked={showChords} onCheckedChange={setShowChords} />
        </div>
      )}
      
      <div className="font-sans text-base leading-relaxed whitespace-pre-wrap">
        {showChords && chords ? (
          <div className="font-mono text-sm bg-muted/10 p-4 rounded-lg">{chords}</div>
        ) : (
          lyrics || <span className="text-muted-foreground italic">Lyrics not provided</span>
        )}
      </div>
    </div>
  );
}
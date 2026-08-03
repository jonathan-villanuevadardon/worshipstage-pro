import React from 'react';

export default function ChordDisplay({ content }) {
  if (!content) return <div className="text-muted-foreground italic">No chords available</div>;

  // Simple pre-formatted text for chords to maintain spacing
  return (
    <div className="font-mono text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border overflow-x-auto">
      {content}
    </div>
  );
}
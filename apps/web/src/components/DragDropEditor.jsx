import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Trash2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DurationDisplay from './DurationDisplay';

export default function DragDropEditor({ songs, onReorder, onUpdateSong, onRemoveSong }) {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    const newSongs = Array.from(songs);
    const [reorderedItem] = newSongs.splice(sourceIndex, 1);
    newSongs.splice(destinationIndex, 0, reorderedItem);
    
    // Update order property
    const updatedSongs = newSongs.map((song, index) => ({
      ...song,
      order: index + 1
    }));
    
    onReorder(updatedSongs);
  };

  if (!songs || songs.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-border rounded-xl bg-muted/10 text-muted-foreground">
        <Music className="w-8 h-8 mx-auto mb-3 opacity-50" />
        <p>No songs added yet.</p>
        <p className="text-sm mt-1">Search and select songs above to build your repertoire.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="repertoire-songs">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef}
            className="space-y-3"
          >
            {songs.map((rs, index) => {
              const songData = rs.expand?.song_id || rs.songData || {};
              
              return (
                <Draggable key={rs.id || `temp-${index}`} draggableId={rs.id || `temp-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-xl transition-all ${
                        snapshot.isDragging ? 'shadow-xl border-primary ring-1 ring-primary/20 z-50' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div 
                        {...provided.dragHandleProps}
                        className="flex items-center justify-center text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing px-1"
                      >
                        <GripVertical className="w-5 h-5" />
                      </div>
                      
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-foreground truncate">{songData.title || 'Unknown Song'}</h4>
                            <p className="text-sm text-muted-foreground truncate">{songData.artist || 'Unknown Artist'}</p>
                          </div>
                          <DurationDisplay seconds={songData.duration_seconds} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Key Adjustment</Label>
                            <Select 
                              value={rs.key_adjustment || songData.key || ''} 
                              onValueChange={(val) => onUpdateSong(index, 'key_adjustment', val)}
                            >
                              <SelectTrigger className="h-8 text-sm bg-background">
                                <SelectValue placeholder="Original Key" />
                              </SelectTrigger>
                              <SelectContent>
                                {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map(k => (
                                  <SelectItem key={k} value={k}>{k}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="md:col-span-2 space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Notes for Team</Label>
                            <Input 
                              value={rs.notes || ''} 
                              onChange={(e) => onUpdateSong(index, 'notes', e.target.value)}
                              placeholder="e.g. Start acoustic, build on chorus 2"
                              className="h-8 text-sm bg-background"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start justify-end shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onRemoveSong(index)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
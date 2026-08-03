import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import SongActions from './SongActions';

export default function SongListItem({ song, onDeleted }) {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/songs/${song.id}`)}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold">
          {song.key || '-'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
          <p className="text-sm text-muted-foreground truncate">{song.artist || 'Unknown Artist'}</p>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-6 flex-shrink-0 mx-4">
        <div className="w-24 text-sm text-muted-foreground">
          {song.tempo ? `${song.tempo} BPM` : '-'}
        </div>
        <div className="w-24">
          {song.genre && (
            <Badge variant="secondary" className="bg-secondary/10 text-secondary font-normal">
              {song.genre}
            </Badge>
          )}
        </div>
        <div className="w-20">
          {song.difficulty && (
            <Badge variant="outline" className="font-normal">
              {song.difficulty}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <SongActions song={song} onDeleted={onDeleted} />
      </div>
    </div>
  );
}
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Clock, Activity } from 'lucide-react';
import SongActions from './SongActions';
import { useNavigate } from 'react-router-dom';

export default function SongCard({ song, onDeleted }) {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col h-full bg-card">
      <CardContent className="p-5 flex-grow cursor-pointer" onClick={() => navigate(`/songs/${song.id}`)}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg line-clamp-1">{song.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-1">{song.artist || 'Unknown Artist'}</p>
          </div>
          {song.genre && (
            <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
              {song.genre}
            </Badge>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
          {song.key && (
            <div className="flex items-center gap-1">
              <Music className="w-3.5 h-3.5" /> {song.key}
            </div>
          )}
          {song.tempo && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {song.tempo} BPM
            </div>
          )}
          {song.difficulty && (
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> {song.difficulty}
            </div>
          )}
        </div>

        {song.theme && song.theme.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {song.theme.slice(0, 3).map((t, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal border-border/50">
                {t}
              </Badge>
            ))}
            {song.theme.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal border-border/50">
                +{song.theme.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/50 mt-auto">
        <div className="text-xs text-muted-foreground">
          {song.language || 'English'}
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <SongActions song={song} onDeleted={onDeleted} />
        </div>
      </CardFooter>
    </Card>
  );
}
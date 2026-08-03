import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Search, Loader2, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import pb from '@/lib/supabaseClient';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDuration } from '@/lib/repertoireUtils';

export default function SongSearchInput({ onSongSelect, organizationId }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        let filterStr = `organization_id = "${organizationId}"`;
        if (debouncedSearch) {
          filterStr += ` && (title ~ "${debouncedSearch}" || artist ~ "${debouncedSearch}")`;
        }
        
        const result = await pb.collection('songs').getList(1, 10, {
          filter: filterStr,
          sort: 'title',
          $autoCancel: false
        });
        setSongs(result.items);
      } catch (error) {
        console.error('Error searching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [debouncedSearch, open, organizationId]);

  const handleSelect = (song) => {
    onSongSelect(song);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span>Search for a song to add...</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type title or artist..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Searching...
                </div>
              ) : (
                "No songs found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {songs.map((song) => (
                <CommandItem
                  key={song.id}
                  value={song.id}
                  onSelect={() => handleSelect(song)}
                  className="flex items-center justify-between cursor-pointer py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{song.title}</span>
                      <span className="text-xs text-muted-foreground">{song.artist || 'Unknown Artist'}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-col items-end">
                    <span>{song.key || '-'}</span>
                    <span>{formatDuration(song.duration_seconds)}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, LayoutGrid, List as ListIcon, FilterX } from 'lucide-react';
import SongCard from '@/components/SongCard';
import SongListItem from '@/components/SongListItem';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';

export default function SongLibraryPage() {
  const { currentUser, activeOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const [genre, setGenre] = useState(searchParams.get('genre') || 'all');
  const [sort, setSort] = useState(searchParams.get('sort') || '-created');

  useEffect(() => {
    fetchSongs();
    
    // Update URL params
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('q', debouncedSearch);
    if (genre !== 'all') params.set('genre', genre);
    if (sort !== '-created') params.set('sort', sort);
    setSearchParams(params);
  }, [debouncedSearch, genre, sort, currentUser, activeOrganizationId]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      if (!activeOrganizationId) return;
      let filterStr = `organization_id = "${activeOrganizationId}"`;
      
      if (debouncedSearch) {
        filterStr += ` && (title ~ "${debouncedSearch}" || artist ~ "${debouncedSearch}")`;
      }
      if (genre !== 'all') {
        filterStr += ` && genre = "${genre}"`;
      }

      const result = await pb.collection('songs').getList(1, 50, {
        filter: filterStr,
        sort: sort,
        $autoCancel: false
      });
      
      setSongs(result.items);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGenre('all');
    setSort('-created');
  };

  const handleDeleted = (id) => {
    setSongs(songs.filter(s => s.id !== id));
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Song Library</h1>
          <p className="text-muted-foreground mt-1">Manage your worship repertoire</p>
        </div>
        <Button onClick={() => navigate('/songs/new')} className="gap-2">
          <Plus className="w-4 h-4" /> Add Song
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or artist..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-[140px] bg-card">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="Worship">Worship</SelectItem>
              <SelectItem value="Contemporary">Contemporary</SelectItem>
              <SelectItem value="Hymn">Hymn</SelectItem>
              <SelectItem value="Praise">Praise</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px] bg-card">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created">Newest First</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="-title">Title (Z-A)</SelectItem>
              <SelectItem value="artist">Artist</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-card border border-border rounded-md p-1">
            <Button 
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="w-4 h-4" />
            </Button>
          </div>

          {(searchTerm || genre !== 'all' || sort !== '-created') && (
            <Button variant="ghost" onClick={clearFilters} className="gap-2 text-muted-foreground">
              <FilterX className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading songs..." className="mt-20" />
      ) : songs.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="No songs found"
          description="Try adjusting your search or filters, or add a new song to your library."
          action={
            <Button onClick={() => navigate('/songs/new')} variant="outline">
              Add New Song
            </Button>
          }
        />
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "flex flex-col gap-3"
        }>
          {songs.map(song => (
            viewMode === 'grid' 
              ? <SongCard key={song.id} song={song} onDeleted={handleDeleted} />
              : <SongListItem key={song.id} song={song} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

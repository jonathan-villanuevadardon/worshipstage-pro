import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Music, Clock, Activity, Youtube, PlayCircle, ArrowRightLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import LyricsDisplay from '@/components/LyricsDisplay';
import ChordDisplay from '@/components/ChordDisplay';
import SongActions from '@/components/SongActions';
import SongTransposeViewer from '@/components/SongTransposeViewer.jsx';

export default function SongDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transposeOpen, setTransposeOpen] = useState(false);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const data = await pb.collection('songs').getOne(id, { $autoCancel: false });
        setSong(data);
      } catch (error) {
        console.error(error);
        navigate('/songs');
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner text="Loading song..." className="mt-20" />;
  if (!song) return null;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/songs')} className="mb-6 gap-2 -ml-4">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">{song.title}</h1>
            {song.genre && <Badge variant="secondary" className="bg-secondary/20 text-secondary">{song.genre}</Badge>}
          </div>
          <p className="text-xl text-muted-foreground">{song.artist || 'Unknown Artist'}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setTransposeOpen(true)} className="gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Transponer
          </Button>
          <Button variant="outline" onClick={() => navigate(`/songs/${song.id}/edit`)} className="gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
          <SongActions song={song} onDeleted={() => navigate('/songs')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Tabs defaultValue="chords" className="w-full">
            <TabsList className="w-full justify-start bg-card border border-border">
              <TabsTrigger value="chords">Chords & Lyrics</TabsTrigger>
              <TabsTrigger value="lyrics">Lyrics Only</TabsTrigger>
            </TabsList>
            <TabsContent value="chords" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <ChordDisplay content={song.chords || song.lyrics} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lyrics" className="mt-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <LyricsDisplay lyrics={song.lyrics} chords={song.chords} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Music className="w-4 h-4"/> Key</span>
                <span className="font-medium">{song.key || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/> Tempo</span>
                <span className="font-medium">{song.tempo ? `${song.tempo} BPM` : '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4"/> Difficulty</span>
                <span className="font-medium">{song.difficulty || '-'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Language</span>
                <span className="font-medium">{song.language || 'English'}</span>
              </div>
            </CardContent>
          </Card>

          {(song.youtube_url || song.spotify_url) && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {song.youtube_url && (
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => window.open(song.youtube_url, '_blank')}>
                    <Youtube className="w-4 h-4 text-red-500" /> Watch on YouTube
                  </Button>
                )}
                {song.spotify_url && (
                  <Button variant="outline" className="w-full justify-start gap-3" onClick={() => window.open(song.spotify_url, '_blank')}>
                    <PlayCircle className="w-4 h-4 text-green-500" /> Listen on Spotify
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={transposeOpen} onOpenChange={setTransposeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Transponer - {song.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 mt-4">
            <SongTransposeViewer 
              songText={song.chords || song.lyrics || ''}
              originalKey={song.key || 'C'}
              initialTranspose={0}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SongFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { currentUser, activeOrganizationId } = useAuth();
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    composer: '',
    key: '',
    tempo: '',
    duration: '',
    genre: '',
    difficulty: '',
    language: 'English',
    lyrics: '',
    chords: '',
    youtube_url: '',
    spotify_url: '',
    notes: '',
    status: 'active'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchSong = async () => {
        try {
          const song = await pb.collection('songs').getOne(id, { $autoCancel: false });
          setFormData({
            title: song.title || '',
            artist: song.artist || '',
            composer: song.composer || '',
            key: song.key || '',
            tempo: song.tempo || '',
            duration: song.duration || '',
            genre: song.genre || '',
            difficulty: song.difficulty || '',
            language: song.language || 'English',
            lyrics: song.lyrics || '',
            chords: song.chords || '',
            youtube_url: song.youtube_url || '',
            spotify_url: song.spotify_url || '',
            notes: song.notes || '',
            status: song.status || 'active'
          });
        } catch (error) {
          toast.error('Failed to load song');
          navigate('/songs');
        } finally {
          setLoading(false);
        }
      };
      fetchSong();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        organization_id: activeOrganizationId,
        tempo: formData.tempo ? parseInt(formData.tempo) : null
      };

      if (isEdit) {
        await pb.collection('songs').update(id, dataToSave, { $autoCancel: false });
        toast.success('Song updated successfully');
      } else {
        const newSong = await pb.collection('songs').create(dataToSave, { $autoCancel: false });
        toast.success('Song created successfully');
        navigate(`/songs/${newSong.id}`);
        return;
      }
      navigate('/songs');
    } catch (error) {
      console.error(error);
      toast.error(isEdit ? 'Failed to update song' : 'Failed to create song');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading song details..." className="mt-20" />;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/songs')} className="mb-6 gap-2 -ml-4">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{isEdit ? 'Edit Song' : 'Add New Song'}</h1>
        <p className="text-muted-foreground mt-1">Fill in the details for your worship repertoire.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist / Original Performer</Label>
                <Input id="artist" name="artist" value={formData.artist} onChange={handleChange} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Musical Key</Label>
                <Select value={formData.key} onValueChange={(v) => handleSelectChange('key', v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select Key" /></SelectTrigger>
                  <SelectContent>
                    {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map(k => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tempo">Tempo (BPM)</Label>
                <Input id="tempo" name="tempo" type="number" value={formData.tempo} onChange={handleChange} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={formData.genre} onValueChange={(v) => handleSelectChange('genre', v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select Genre" /></SelectTrigger>
                  <SelectContent>
                    {['Worship', 'Contemporary', 'Hymn', 'Praise', 'Intercession'].map(g => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => handleSelectChange('difficulty', v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select Difficulty" /></SelectTrigger>
                  <SelectContent>
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea 
                id="lyrics" 
                name="lyrics" 
                value={formData.lyrics} 
                onChange={handleChange} 
                className="min-h-[200px] bg-background font-sans" 
                placeholder="Enter lyrics here..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chords">Chords</Label>
              <Textarea 
                id="chords" 
                name="chords" 
                value={formData.chords} 
                onChange={handleChange} 
                className="min-h-[200px] bg-background font-mono" 
                placeholder="Enter chord chart here..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Media & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="youtube_url">YouTube URL</Label>
                <Input id="youtube_url" name="youtube_url" type="url" value={formData.youtube_url} onChange={handleChange} className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify_url">Spotify URL</Label>
                <Input id="spotify_url" name="spotify_url" type="url" value={formData.spotify_url} onChange={handleChange} className="bg-background" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/songs')} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? 'Save Changes' : 'Create Song'}
          </Button>
        </div>
      </form>
    </div>
  );
}

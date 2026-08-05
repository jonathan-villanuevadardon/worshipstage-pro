import React, { useState, useEffect, useMemo } from 'react';
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
import { getChordKey, parseChords } from '@/lib/musicTransposition';

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

  const chordAnalysis = useMemo(() => {
    const source = [formData.lyrics, formData.chords]
      .filter((value) => value.trim())
      .join('\n');
    const detectedChords = parseChords(source);
    return {
      count: detectedChords.length,
      key: detectedChords.length > 0 ? getChordKey(detectedChords[0].chord) : '',
    };
  }, [formData.chords, formData.lyrics]);

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
      toast.error('El título es obligatorio.');
      return;
    }
    if (!activeOrganizationId) {
      toast.error('Selecciona una iglesia antes de guardar la canción.');
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        organization_id: activeOrganizationId,
        key: formData.key || chordAnalysis.key,
        tempo: formData.tempo === '' ? 0 : Number(formData.tempo),
      };

      if (!Number.isFinite(dataToSave.tempo) || dataToSave.tempo < 0) {
        toast.error('El tempo debe ser un número válido.');
        return;
      }

      if (!isEdit) dataToSave.created_by = currentUser?.id || '';

      if (isEdit) {
        await pb.collection('songs').update(id, dataToSave, { $autoCancel: false });
        toast.success('Canción actualizada correctamente.');
      } else {
        const newSong = await pb.collection('songs').create(dataToSave, { $autoCancel: false });
        toast.success('Canción creada correctamente.');
        navigate(`/songs/${newSong.id}`);
        return;
      }
      navigate('/songs');
    } catch (error) {
      console.error(error);
      const action = isEdit ? 'actualizar' : 'crear';
      toast.error(`No fue posible ${action} la canción: ${error.message || 'error desconocido'}`);
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
                placeholder={'Escribe la letra con acordes, por ejemplo:\n[C]Cristo me ama\n[G]Él me salvó\n[Am]Su gracia me alcanzó'}
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
                placeholder={'Escribe acordes entre corchetes, por ejemplo [C] [G] [Am] [F], o en líneas separadas:\nC   G/B   Am7   Fmaj7'}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {chordAnalysis.count > 0
                    ? `${chordAnalysis.count} acorde${chordAnalysis.count === 1 ? '' : 's'} detectado${chordAnalysis.count === 1 ? '' : 's'} · tonalidad probable: ${chordAnalysis.key}`
                    : 'Todavía no se detectan acordes. Usa [C] o una línea como C  G  Am  F.'}
                </span>
                {chordAnalysis.key && formData.key !== chordAnalysis.key && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectChange('key', chordAnalysis.key)}
                  >
                    Usar tonalidad {chordAnalysis.key}
                  </Button>
                )}
              </div>
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

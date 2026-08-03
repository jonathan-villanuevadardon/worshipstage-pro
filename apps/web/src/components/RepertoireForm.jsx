import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import SongSearchInput from './SongSearchInput';
import DragDropEditor from './DragDropEditor';
import { calculateTotalDuration } from '@/lib/repertoireUtils';
import DurationDisplay from './DurationDisplay';

const SERVICE_TYPES = ['Sunday Service', 'Prayer Meeting', 'Youth Service', 'Wedding', 'Funeral', 'Conference', 'Special Event'];

export default function RepertoireForm({ initialData = null, initialSongs = [], isEdit = false }) {
  const navigate = useNavigate();
  const { currentUser, activeOrganizationId } = useAuth();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_type: 'Sunday Service',
    status: 'draft',
    ...initialData
  });

  const [songs, setSongs] = useState(initialSongs);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSong = (song) => {
    const newSong = {
      id: `temp-${Date.now()}`,
      song_id: song.id,
      order: songs.length + 1,
      key_adjustment: song.key || '',
      notes: '',
      songData: song, // Keep for display
      isNew: true
    };
    setSongs([...songs, newSong]);
  };

  const handleReorderSongs = (reorderedSongs) => {
    setSongs(reorderedSongs);
  };

  const handleUpdateSong = (index, field, value) => {
    const updatedSongs = [...songs];
    updatedSongs[index] = { ...updatedSongs[index], [field]: value };
    setSongs(updatedSongs);
  };

  const handleRemoveSong = (index) => {
    const updatedSongs = [...songs];
    updatedSongs.splice(index, 1);
    // Re-calculate order
    const reordered = updatedSongs.map((s, i) => ({ ...s, order: i + 1 }));
    setSongs(reordered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Repertoire name is required');
      return;
    }

    setSaving(true);
    try {
      const totalDuration = calculateTotalDuration(songs);
      
      const repertoireData = {
        ...formData,
        organization_id: activeOrganizationId,
        created_by: currentUser.id,
        total_duration: totalDuration,
        song_count: songs.length
      };

      let repertoireId = initialData?.id;

      if (isEdit) {
        await pb.collection('repertoires').update(repertoireId, repertoireData, { $autoCancel: false });
        
        // Handle songs update (simple approach: delete all existing and recreate)
        // In a production app, you'd want to diff them to preserve IDs, but this is safer for demo
        const existingSongs = await pb.collection('repertoire_songs').getFullList({
          filter: `repertoire_id="${repertoireId}"`,
          $autoCancel: false
        });
        
        for (const es of existingSongs) {
          await pb.collection('repertoire_songs').delete(es.id, { $autoCancel: false });
        }
      } else {
        const newRepertoire = await pb.collection('repertoires').create(repertoireData, { $autoCancel: false });
        repertoireId = newRepertoire.id;
      }

      // Create new repertoire_songs records
      for (const song of songs) {
        await pb.collection('repertoire_songs').create({
          repertoire_id: repertoireId,
          song_id: song.song_id || song.expand?.song_id?.id,
          order: song.order,
          key_adjustment: song.key_adjustment,
          notes: song.notes,
          duration_seconds: song.songData?.duration_seconds || song.expand?.song_id?.duration_seconds || 0
        }, { $autoCancel: false });
      }

      toast.success(`Repertoire ${isEdit ? 'updated' : 'created'} successfully`);
      navigate(`/repertoires/${repertoireId}`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} repertoire`);
    } finally {
      setSaving(false);
    }
  };

  const totalDuration = calculateTotalDuration(songs);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Repertoire Name *</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  className="bg-background" 
                  placeholder="e.g. Sunday Morning Worship"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={formData.service_type} onValueChange={(v) => handleSelectChange('service_type', v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  className="bg-background min-h-[100px]" 
                  placeholder="Optional notes about this service..."
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Total Songs</span>
                <span className="font-bold text-xl">{songs.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Est. Duration</span>
                <DurationDisplay seconds={totalDuration} className="font-bold text-xl text-foreground" showIcon={false} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle>Setlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-xl border border-border">
                <Label className="mb-2 block">Add Song</Label>
                <SongSearchInput 
                  organizationId={activeOrganizationId} 
                  onSongSelect={handleAddSong} 
                />
              </div>

              <DragDropEditor 
                songs={songs} 
                onReorder={handleReorderSongs}
                onUpdateSong={handleUpdateSong}
                onRemoveSong={handleRemoveSong}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 sticky bottom-0 p-4 bg-background/80 backdrop-blur-md border-t border-border -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none">
        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="gap-2 min-w-[140px]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Repertoire'}
        </Button>
      </div>
    </form>
  );
}

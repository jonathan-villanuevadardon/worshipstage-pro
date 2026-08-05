import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, Globe, FileText, Share2, Music, ArrowRightLeft, Eye } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import DurationDisplay from '@/components/DurationDisplay';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import RepertoireExportModal from '@/components/RepertoireExportModal.jsx';
import SongTransposeViewer from '@/components/SongTransposeViewer.jsx';
import { getRepertoireSongView } from '@/lib/repertoireSongUtils.js';

export default function RepertoireDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [repertoire, setRepertoire] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  
  // Transpose modal state
  const [transposeSongId, setTransposeSongId] = useState(null);
  const [transposeData, setTransposeData] = useState(null); // { text, key, initialTranspose, repSongId, title }
  const [tempTransposeValue, setTempTransposeValue] = useState(0);
  const [tempDestinationKey, setTempDestinationKey] = useState('');
  const [savingTranspose, setSavingTranspose] = useState(false);

  const canManage = ['super_admin', 'pastor', 'worship_leader', 'church_admin'].includes(currentUser?.role);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const repData = await pb.collection('repertoires').getOne(id, { 
        expand: 'created_by',
        $autoCancel: false 
      });
      const songsData = await pb.collection('repertoire_songs').getFullList({
        filter: `repertoire_id="${id}"`,
        sort: 'order',
        expand: 'song_id',
        $autoCancel: false
      });
      
      setRepertoire(repData);
      setSongs(songsData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load repertoire');
      navigate('/repertoires');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await pb.collection('repertoires').delete(id, { $autoCancel: false });
      toast.success('Repertoire deleted');
      navigate('/repertoires');
    } catch (err) {
      toast.error('Failed to delete repertoire');
    }
  };

  const toggleStatus = async () => {
    try {
      const newStatus = repertoire.status === 'published' ? 'draft' : 'published';
      await pb.collection('repertoires').update(id, { status: newStatus }, { $autoCancel: false });
      toast.success(`Repertoire ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const openTranspose = (repSong) => {
    const { song, originalKey, displayKey, semitones, originalContent } = getRepertoireSongView(repSong);
    if (!song) return;

    setTransposeData({
      text: originalContent,
      key: originalKey || 'C',
      repSongId: repSong.id,
      title: song.title,
      initialTranspose: semitones,
    });
    setTempTransposeValue(semitones);
    setTempDestinationKey(displayKey || originalKey || 'C');
    setTransposeSongId(repSong.id);
  };

  const handleTransposePreviewChange = useCallback((value, details) => {
    setTempTransposeValue(value);
    if (details?.realKey) setTempDestinationKey(details.realKey);
  }, []);

  const saveRepertoireTransposition = async () => {
    if (!transposeSongId || !transposeData || !canManage) return;
    setSavingTranspose(true);
    try {
      const savedKey = tempTransposeValue === 0 ? '' : tempDestinationKey;
      await pb.collection('repertoire_songs').update(transposeSongId, {
        key_adjustment: savedKey,
      }, { $autoCancel: false });
      setSongs((currentSongs) => currentSongs.map((item) => (
        item.id === transposeSongId ? { ...item, key_adjustment: savedKey } : item
      )));
      toast.success('Tonalidad guardada sólo para este repertorio');
      setTransposeSongId(null);
    } catch (error) {
      console.error('Failed to save repertoire transposition:', error);
      toast.error('No fue posible guardar la tonalidad del repertorio');
    } finally {
      setSavingTranspose(false);
    }
  };

  const handleModalCloseChange = (open) => {
    if (!open) {
      setTransposeSongId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading repertoire..." className="mt-20" />;
  if (!repertoire) return null;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/repertoires')} className="mb-6 gap-2 -ml-4">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </Button>

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold tracking-tight">{repertoire.name}</h1>
            <StatusBadge status={repertoire.status} />
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Badge variant="secondary" className="bg-secondary/10 text-secondary">{repertoire.service_type}</Badge>
            <span>•</span>
            <span>Created by {repertoire.expand?.created_by?.first_name || 'Unknown'}</span>
            <span>•</span>
            <span>{new Date(repertoire.created).toLocaleDateString()}</span>
          </div>
          {repertoire.description && (
            <p className="mt-4 text-muted-foreground max-w-3xl">{repertoire.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/repertoires/${id}/preview`)} className="gap-2">
            <Eye className="w-4 h-4" /> Vista e impresión
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
            <FileText className="w-4 h-4" /> Exportar
          </Button>
          <Button variant="outline" onClick={handleShare} className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          {canManage && (
            <Button onClick={() => navigate(`/repertoires/${id}/edit`)} className="gap-2">
              <Edit className="w-4 h-4" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-base border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Duration</p>
            <DurationDisplay seconds={repertoire.total_duration} className="text-2xl font-bold text-foreground" showIcon={false} />
          </CardContent>
        </Card>
        <Card className="card-base border-border">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Songs</p>
            <p className="text-2xl font-bold">{repertoire.song_count || 0}</p>
          </CardContent>
        </Card>
        <Card className="card-base border-border md:col-span-2 flex items-center justify-end p-6 gap-2">
          {canManage && (
            <>
              <Button variant={repertoire.status === 'published' ? 'outline' : 'secondary'} onClick={toggleStatus} className="gap-2">
                <Globe className="w-4 h-4" /> {repertoire.status === 'published' ? 'Unpublish' : 'Publish'}
              </Button>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)} size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </Card>
      </div>

      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" /> Setlist
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Song</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No songs in this repertoire.
                    </TableCell>
                  </TableRow>
                ) : (
                  songs.map((rs, index) => {
                    const song = rs.expand?.song_id || {};
                    return (
                      <TableRow key={rs.id} className="hover:bg-muted/30">
                        <TableCell className="text-center font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{song.title || 'Unknown Song'}</div>
                          <div className="text-sm text-muted-foreground">{song.artist || 'Unknown Artist'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            {rs.key_adjustment && rs.key_adjustment !== song.key ? (
                              <Badge variant="default" className="font-mono bg-primary/20 text-primary border-primary/30">
                                Orig: {song.key} → {rs.key_adjustment}
                              </Badge>
                            ) : song.key ? (
                              <Badge variant="outline" className="font-mono bg-muted border-border">
                                {song.key}
                              </Badge>
                            ) : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DurationDisplay seconds={song.duration_seconds} />
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                          {rs.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => openTranspose(rs)}
                              className="gap-2"
                            >
                              <ArrowRightLeft className="w-3 h-3" /> Transponer
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/songs/${song.id}`)}
                              className="text-primary hover:text-primary/80"
                            >
                              View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Repertoire"
        description={`Are you sure you want to delete "${repertoire.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />

      <RepertoireExportModal 
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        repertoire={repertoire}
        songs={songs}
      />

      <Dialog open={!!transposeSongId} onOpenChange={handleModalCloseChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>Transponer - {transposeData?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 mt-4">
            {transposeData && (
              <SongTransposeViewer 
                songText={transposeData.text}
                originalKey={transposeData.key}
                initialTranspose={transposeData.initialTranspose}
                onTransposeChange={handleTransposePreviewChange}
              />
            )}
          </div>
          <DialogFooter className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground sm:justify-between">
            <span>{canManage ? 'El cambio se guardará únicamente en este repertorio.' : 'Vista de la tonalidad guardada en el repertorio.'}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTransposeSongId(null)} disabled={savingTranspose}>Cancelar</Button>
              {canManage && (
                <Button onClick={saveRepertoireTransposition} disabled={savingTranspose}>
                  {savingTranspose ? 'Guardando…' : 'Guardar tonalidad'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

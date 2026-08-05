import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import pb from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileText, Share2 } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import DurationDisplay from '@/components/DurationDisplay';
import { exportToText } from '@/lib/repertoireUtils';
import { getRepertoireSongView } from '@/lib/repertoireSongUtils';
import { toast } from 'sonner';
import RepertoireExportModal from '@/components/RepertoireExportModal.jsx';

export default function RepertoirePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [repertoire, setRepertoire] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const repData = await pb.collection('repertoires').getOne(id, { $autoCancel: false });
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
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (loading) return <LoadingSpinner text="Loading preview..." className="mt-20" />;
  if (!repertoire) return null;

  return (
    <div className="min-h-screen bg-background print:bg-white">
      {/* Non-printable header controls */}
      <div className="no-print sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="container max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => navigate(`/repertoires/${id}`)} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" onClick={() => exportToText(repertoire, songs)} className="gap-2">
              <FileText className="w-4 h-4" /> Text
            </Button>
            <Button variant="outline" onClick={() => setExportOpen(true)} className="gap-2">
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button onClick={() => setExportOpen(true)} className="gap-2">
              <Printer className="w-4 h-4" /> Print
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12 print:py-0 print:text-black">
        <div className="mb-10 border-b border-border print:border-black/20 pb-6">
          <h1 className="text-4xl font-bold tracking-tight mb-2 print:text-black">{repertoire.name}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground print:text-black/70">
            <span>{repertoire.service_type}</span>
            <span>•</span>
            <span>{new Date(repertoire.created).toLocaleDateString()}</span>
            <span>•</span>
            <DurationDisplay seconds={repertoire.total_duration} className="print:text-black/70" />
          </div>
          {repertoire.description && (
            <p className="mt-4 text-foreground print:text-black">{repertoire.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {songs.map((rs, index) => {
            const { song, originalKey, displayKey, content } = getRepertoireSongView(rs);
            return (
              <div key={rs.id} className="flex gap-6 p-4 rounded-xl border border-border print:border-black/20 bg-card print:bg-transparent">
                <div className="text-2xl font-bold text-muted-foreground print:text-black/40 w-8 text-right shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold print:text-black">{song.title || 'Unknown Song'}</h3>
                    <DurationDisplay seconds={song.duration_seconds} className="print:text-black/70" />
                  </div>
                  <p className="text-muted-foreground print:text-black/70 mb-3">{song.artist || 'Unknown Artist'}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {displayKey && (
                      <div>
                        <span className="text-muted-foreground print:text-black/60 block text-xs uppercase tracking-wider mb-1">Key</span>
                        <span className="font-mono font-medium print:text-black">
                          {displayKey}{displayKey !== originalKey ? ` (original: ${originalKey || 'N/A'})` : ''}
                        </span>
                      </div>
                    )}
                    {rs.notes && (
                      <div className="sm:col-span-2">
                        <span className="text-muted-foreground print:text-black/60 block text-xs uppercase tracking-wider mb-1">Notes</span>
                        <span className="print:text-black">{rs.notes}</span>
                      </div>
                    )}
                  </div>
                  {content ? (
                    <pre className="mt-5 border-t border-border print:border-black/20 pt-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground print:text-black">
                      {content}
                    </pre>
                  ) : (
                    <p className="mt-5 border-t border-border print:border-black/20 pt-4 text-sm italic text-muted-foreground print:text-black/60">
                      No hay letras o acordes guardados para esta canción.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {songs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground print:text-black/50 italic">
            No songs in this repertoire.
          </div>
        )}
      </div>
      <RepertoireExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        repertoire={repertoire}
        songs={songs}
      />
    </div>
  );
}

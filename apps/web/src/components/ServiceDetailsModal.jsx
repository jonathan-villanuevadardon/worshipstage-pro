import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Printer, Edit, Trash2, MapPin, Clock, Users, Music, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import pb from '@/lib/supabaseClient';
import apiServerClient from '@/lib/apiServerClient';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import { transposeSong } from '@/lib/musicTransposition.js';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function ServiceDetailsModal({ service, open, onClose, onRefresh }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  if (!service) return null;

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const canEdit = ['super_admin', 'church_admin', 'pastor', 'worship_leader'].includes(currentUser?.role);

  const getIndex = (k) => {
    const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    let i = SHARPS.indexOf(k);
    if (i === -1) i = FLATS.indexOf(k);
    return i !== -1 ? i : 0;
  };

  const handleDelete = async () => {
    if (!isSuperAdmin) {
      toast.error("Forbidden: Only Super Admins can delete services.");
      setDeleteConfirmOpen(false);
      return;
    }
    try {
      setIsDeleting(true);
      const res = await apiServerClient.fetch(`/services/${service.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete service');
      }
      toast.success('Service deleted successfully');
      setDeleteConfirmOpen(false);
      onClose();
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.message || 'An error occurred while deleting');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      toast.info('Generating PDF...');
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`Service: ${service.title || service.name}`, 20, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Date: ${format(new Date(service.date), 'MMMM d, yyyy')} | Time: ${service.start_time || 'TBD'}`, 20, 30);
      doc.text(`Location: ${service.location || 'Main Sanctuary'}`, 20, 37);

      let y = 50;

      // Fetch team members
      const assignments = await pb.collection('service_assignments').getFullList({
        filter: `service_id="${service.id}"`,
        expand: 'team_member_id',
        $autoCancel: false
      });

      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42);
      doc.text('Team Schedule', 20, y);
      y += 8;

      doc.setFontSize(11);
      doc.setTextColor(71, 85, 105);
      if (assignments.length > 0) {
        assignments.forEach(a => {
          const name = a.expand?.team_member_id?.first_name || a.expand?.team_member_id?.name || 'Unknown';
          doc.text(`• ${name} - ${a.role}`, 25, y);
          y += 6;
        });
      } else {
        doc.text('No team members assigned yet.', 25, y);
        y += 6;
      }

      y += 10;

      // Fetch Repertoire
      if (service.repertoire_id) {
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        doc.text('Repertoire & Chords', 20, y);
        y += 10;

        const repSongs = await pb.collection('repertoire_songs').getFullList({
          filter: `repertoire_id="${service.repertoire_id}"`,
          sort: 'order',
          expand: 'song_id',
          $autoCancel: false
        });

        if (repSongs.length > 0) {
          for (let i = 0; i < repSongs.length; i++) {
            const rs = repSongs[i];
            const song = rs.expand?.song_id;
            if (!song) continue;

            if (y > 260) { doc.addPage(); y = 20; }

            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(`${i + 1}. ${song.title}`, 20, y);
            y += 6;

            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            const keyText = rs.key_adjustment && rs.key_adjustment !== song.key
              ? `Orig: ${song.key || 'N/A'} -> Transposed: ${rs.key_adjustment}`
              : `Key: ${song.key || 'N/A'}`;
            doc.text(keyText, 25, y);
            y += 8;

            // Transpose chords if needed
            let displayChords = song.chords || song.lyrics || '';
            if (displayChords && rs.key_adjustment && song.key) {
               let diff = getIndex(rs.key_adjustment) - getIndex(song.key);
               if (diff > 6) diff -= 12;
               if (diff < -6) diff += 12;
               displayChords = transposeSong(displayChords, diff, 'sharps');
            }

            doc.setFont('courier', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);

            // Split and print chords snippet (limit to first 30 lines to prevent massive PDFs)
            const lines = doc.splitTextToSize(displayChords, 170).slice(0, 30);
            lines.forEach(line => {
              if (y > 275) { doc.addPage(); y = 20; }
              doc.text(line, 25, y);
              y += 4;
            });
            y += 8;
            doc.setFont('helvetica', 'normal'); // reset font
          }
        } else {
          doc.setFontSize(11);
          doc.text('No songs found in the attached repertoire.', 25, y);
        }
      } else {
        doc.setFontSize(11);
        doc.text('No repertoire attached to this service.', 20, y);
      }

      doc.save(`Service_Sheet_${format(new Date(service.date), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex justify-between items-start pr-6">
              <div>
                <Badge variant="secondary" className="mb-2">{service.service_type}</Badge>
                <DialogTitle className="text-2xl">{service.title || service.name}</DialogTitle>
                <p className="text-muted-foreground mt-1">{format(new Date(service.date), 'EEEE, MMMM d, yyyy')}</p>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span><span className="font-medium">Time:</span> {service.start_time || 'TBD'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span><span className="font-medium">Location:</span> {service.location || 'Not specified'}</span>
              </div>
              {service.theme && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span><span className="font-medium">Theme:</span> {service.theme}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Music className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Repertoire:</span>
                {service.expand?.repertoire_id ? (
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/repertoires/${service.repertoire_id}`)}>
                    {service.expand.repertoire_id.name}
                  </Button>
                ) : (
                  <span className="text-muted-foreground italic">None assigned</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">Team:</span>{' '}
                  {service.expand?.service_assignments_via_service_id?.length || 0} members assigned
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border mt-4 justify-between">
            <Button variant="secondary" onClick={handlePrint} disabled={isPrinting} className="gap-2">
              <Printer className="w-4 h-4" /> {isPrinting ? 'Generating...' : 'Print Sheet'}
            </Button>
            
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" className="gap-2" onClick={() => {
                  toast.info("Edit mode not implemented in this demo.");
                }}>
                  <Edit className="w-4 h-4" /> Edit
                </Button>
              )}
              {isSuperAdmin && (
                <Button variant="destructive" className="gap-2" onClick={() => setDeleteConfirmOpen(true)}>
                  <Trash2 className="w-4 h-4" /> Delete
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Service"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Service"}
        onConfirm={handleDelete}
      />
    </>
  );
}
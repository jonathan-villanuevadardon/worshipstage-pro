import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

export default function RepertoireExportModal({ open, onClose, repertoire, songs }) {
  const [exporting, setExporting] = useState(false);

  const generatePDF = () => {
    try {
      setExporting(true);
      const doc = new jsPDF();
      let y = 20;

      // Title
      doc.setFontSize(22);
      doc.text(repertoire?.name || 'Repertoire', 105, y, { align: 'center' });
      y += 10;
      
      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(100);
      const dateStr = repertoire?.created ? new Date(repertoire.created).toLocaleDateString() : '';
      doc.text(`${repertoire?.service_type || 'Service'} • ${dateStr}`, 105, y, { align: 'center' });
      y += 15;
      
      doc.setTextColor(0);

      if (!songs || songs.length === 0) {
        doc.text('No songs in this repertoire.', 20, y);
      } else {
        songs.forEach((rs, index) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          const song = rs.expand?.song_id || {};
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${index + 1}. ${song.title || 'Unknown Song'}`, 20, y);
          y += 6;

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Key: ${rs.key_adjustment || song.key || 'N/A'}  |  Artist: ${song.artist || 'Unknown'}`, 20, y);
          y += 8;

          if (song.lyrics) {
            doc.setFontSize(9);
            const lines = doc.splitTextToSize(song.lyrics.substring(0, 500) + (song.lyrics.length > 500 ? '...' : ''), 170);
            doc.text(lines, 20, y);
            y += (lines.length * 4) + 10;
          } else {
            y += 10;
          }
        });
      }

      doc.save(`${repertoire?.name || 'Repertoire'}.pdf`);
      toast.success('PDF exported successfully');
      onClose();
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    generatePDF(); // Using PDF generation as print basis for now
    // In a real scenario we'd use window.print() on a specialized hidden print view
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Exportar Repertorio</DialogTitle>
          <DialogDescription>
            Choose how you want to export "{repertoire?.name}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2" 
            onClick={generatePDF}
            disabled={exporting}
          >
            <FileText className="w-8 h-8 text-primary" />
            <span>Exportar como PDF</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-24 flex flex-col items-center justify-center gap-2" 
            onClick={handlePrint}
            disabled={exporting}
          >
            <Printer className="w-8 h-8 text-foreground" />
            <span>Imprimir</span>
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={exporting}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
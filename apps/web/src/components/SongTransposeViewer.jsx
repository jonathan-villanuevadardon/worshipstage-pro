import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Printer, Download, Hash, ArrowRightLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import TranspositionPresetButtons from './TranspositionPresetButtons';
import { useSongTransposition } from '@/hooks/useSongTransposition';

const KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

export default function SongTransposeViewer({ 
  songText = '', 
  originalKey = 'C',
  initialTranspose = 0,
  onTransposeChange
}) {
  const {
    transposeValue,
    capo,
    notationMode,
    updateTransposeValue,
    updateNotationMode,
    updateDestinationKey,
    getTransposedSong
  } = useSongTransposition(songText, originalKey);

  // Initialize if passed from props
  React.useEffect(() => {
    if (initialTranspose !== 0) {
      updateTransposeValue(initialTranspose);
    }
  }, [initialTranspose, updateTransposeValue]);

  // Sync upwards if callback provided
  React.useEffect(() => {
    if (onTransposeChange) {
      onTransposeChange(transposeValue);
    }
  }, [transposeValue, onTransposeChange]);

  const transposedContent = useMemo(() => getTransposedSong(songText), [songText, getTransposedSong]);

  const currentKey = useMemo(() => {
    // A simplified helper just to show the new root key
    const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    let idx = SHARPS.indexOf(originalKey);
    if (idx === -1) idx = FLATS.indexOf(originalKey);
    if (idx === -1) return originalKey;

    const newIdx = (((idx + transposeValue) % 12) + 12) % 12;
    return notationMode === 'flats' ? FLATS[newIdx] : SHARPS[newIdx];
  }, [originalKey, transposeValue, notationMode]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Pop-up blocked. Please allow pop-ups to print.');
      return;
    }
    
    // Convert chords to bold spans for printing
    const htmlContent = transposedContent
      .replace(/\[(.*?)\]/g, '<strong style="color: #2563eb;">[$1]</strong>')
      .replace(/\n/g, '<br>');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print - Transposed Song</title>
          <style>
            body { font-family: 'Outfit', sans-serif; padding: 2rem; line-height: 1.6; color: #0f172a; }
            h1 { margin-bottom: 0.2rem; }
            .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
            .content { font-family: monospace; white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Transposed Song</h1>
          <div class="meta">Key: ${currentKey} ${capo > 0 ? `| Capo: ${capo}` : ''}</div>
          <div class="content">${htmlContent}</div>
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      let y = 20;

      doc.setFontSize(20);
      doc.text('Transposed Song', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Key: ${currentKey} ${capo > 0 ? `| Capo: ${capo}` : ''}`, 20, y);
      y += 10;
      
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('courier', 'normal');

      const lines = doc.splitTextToSize(transposedContent, 170);
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });

      doc.save(`Song_${currentKey}.pdf`);
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  // Renderer for the content with highlighted chords
  const renderContent = () => {
    const parts = transposedContent.split(/(\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={i} className="font-bold text-primary bg-primary/5 px-1 rounded mx-0.5">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Controls Header */}
      <Card className="bg-muted/30 border-border shadow-none">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Destination Key</Label>
            <Select value={currentKey} onValueChange={(val) => updateDestinationKey(val, originalKey)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KEYS.map(k => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <div className="flex justify-between items-center">
              <Label>Transpose ({transposeValue > 0 ? `+${transposeValue}` : transposeValue})</Label>
              <TranspositionPresetButtons currentValue={transposeValue} onChange={updateTransposeValue} />
            </div>
            <Slider 
              value={[transposeValue]} 
              min={-12} 
              max={12} 
              step={1} 
              onValueChange={([val]) => updateTransposeValue(val)} 
              className="py-1"
            />
          </div>

          <div className="space-y-2">
            <Label>Notation</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant={notationMode === 'sharps' ? 'default' : 'outline'} 
                size="sm" 
                className="w-full"
                onClick={() => updateNotationMode('sharps')}
              >
                <Hash className="w-4 h-4 mr-1" /> Sharps
              </Button>
              <Button 
                variant={notationMode === 'flats' ? 'default' : 'outline'} 
                size="sm" 
                className="w-full"
                onClick={() => updateNotationMode('flats')}
              >
                <span className="font-bold font-serif italic text-lg leading-none mr-1 pb-1">b</span> Flats
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Original Key</span>
            <span className="font-medium text-foreground">{originalKey}</span>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground opacity-50" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Current Key</span>
            <span className="font-medium text-primary">{currentKey}</span>
          </div>
          {capo > 0 && (
            <>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Capo</span>
                <span className="font-medium text-foreground">Fret {capo}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      {/* Transposed Content */}
      <Card className="flex-1 bg-card border-border overflow-hidden flex flex-col min-h-[400px]">
        <CardContent className="p-6 flex-1 overflow-auto font-mono text-[15px] leading-relaxed whitespace-pre-wrap">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Printer, Download, Hash, ArrowRightLeft, WandSparkles, RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import TranspositionPresetButtons from './TranspositionPresetButtons';
import { useSongTransposition } from '@/hooks/useSongTransposition';
import { ALL_KEYS } from '@/lib/musicTransposition';

export default function SongTransposeViewer({
  songText = '',
  originalKey = '',
  initialTranspose = 0,
  onTransposeChange,
}) {
  const {
    originalKey: detectedOriginalKey,
    transposeValue,
    capo,
    notationMode,
    realKey,
    visualKey,
    recommendedCapo,
    chordsAreSimplified,
    updateTransposeValue,
    updateCapo,
    updateNotationMode,
    updateDestinationKey,
    simplifyChords,
    resetTransposition,
    getTransposedSong,
  } = useSongTransposition(songText, originalKey);

  React.useEffect(() => {
    updateTransposeValue(initialTranspose);
  }, [initialTranspose, updateTransposeValue]);

  React.useEffect(() => {
    onTransposeChange?.(transposeValue, {
      realKey,
      visualKey,
      capo,
      notationMode,
    });
  }, [transposeValue, realKey, visualKey, capo, notationMode, onTransposeChange]);

  const transposedContent = useMemo(
    () => getTransposedSong(songText),
    [songText, getTransposedSong]
  );

  const renderedContent = useMemo(() => {
    return transposedContent.split(/(\[[^\]]+\])/g).map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        return <span key={index} className="font-bold text-primary bg-primary/5 px-1 rounded mx-0.5">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  }, [transposedContent]);

  const metadata = `Tonalidad real: ${realKey} | Tonalidad visual: ${visualKey} | Capo: ${capo}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Permite las ventanas emergentes para imprimir.');
      return;
    }

    const htmlContent = transposedContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\[(.*?)\]/g, '<strong style="color: #2563eb;">[$1]</strong>')
      .replace(/\r\n|\r|\n/g, '<br>');

    printWindow.document.write(`
      <html>
        <head>
          <title>Canción transpuesta</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; line-height: 1.6; color: #0f172a; }
            h1 { margin-bottom: 0.2rem; }
            .meta { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
            .content { font-family: monospace; white-space: pre-wrap; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>Canción transpuesta</h1>
          <div class="meta">${metadata}</div>
          <div class="content">${htmlContent}</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
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
      doc.text('Canción transpuesta', 20, y);
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(metadata, 20, y);
      y += 10;
      doc.setTextColor(0);
      doc.setFontSize(11);
      doc.setFont('courier', 'normal');

      const lines = doc.splitTextToSize(transposedContent, 170);
      lines.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });

      doc.save(`Cancion_${realKey}.pdf`);
      toast.success('PDF generado correctamente.');
    } catch (error) {
      console.error(error);
      toast.error('No fue posible generar el PDF.');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <Card className="bg-muted/30 border-border shadow-none">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Tonalidad destino</Label>
            <Select value={realKey} onValueChange={updateDestinationKey}>
              <SelectTrigger className="bg-background" aria-label="Tonalidad destino">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_KEYS.map((key) => <SelectItem key={key} value={key}>{key}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 lg:col-span-2">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <Label>Semitonos ({transposeValue > 0 ? `+${transposeValue}` : transposeValue})</Label>
              <TranspositionPresetButtons currentValue={transposeValue} onChange={updateTransposeValue} />
            </div>
            <Slider
              aria-label="Transposición por semitonos"
              value={[transposeValue]}
              min={-12}
              max={12}
              step={1}
              onValueChange={([value]) => updateTransposeValue(value)}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground"><span>-12</span><span>0</span><span>+12</span></div>
          </div>

          <div className="space-y-2">
            <Label>Notación</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={notationMode === 'sharps' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => updateNotationMode('sharps')}
              >
                <Hash className="w-4 h-4 mr-1" /> Sostenidos
              </Button>
              <Button
                type="button"
                variant={notationMode === 'flats' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => updateNotationMode('flats')}
              >
                <span className="font-bold font-serif italic text-lg leading-none mr-1 pb-1">b</span> Bemoles
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Capo (0 a 12)</Label>
            <Select value={String(capo)} onValueChange={(value) => updateCapo(Number(value))}>
              <SelectTrigger className="bg-background" aria-label="Capo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 13 }, (_, value) => (
                  <SelectItem key={value} value={String(value)}>{value === 0 ? 'Sin capo' : `Traste ${value}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-4 py-3">
            <div>
              <p className="text-sm font-medium">Acordes simplificados: {chordsAreSimplified ? 'Sí' : 'No'}</p>
              <p className="text-xs text-muted-foreground">Capo recomendado para formas más sencillas: {recommendedCapo}</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={resetTransposition} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Restablecer
              </Button>
              <Button type="button" size="sm" onClick={simplifyChords} disabled={chordsAreSimplified} className="gap-2">
                <WandSparkles className="w-4 h-4" /> Simplificar acordes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Original</span>
            <span className="font-medium text-foreground">{detectedOriginalKey}</span>
          </div>
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground opacity-50" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Tonalidad real</span>
            <span className="font-medium text-primary">{realKey}</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Tonalidad visual</span>
            <span className="font-medium text-foreground">{visualKey}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Capo</span>
            <span className="font-medium text-foreground">{capo}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadPDF} className="gap-2">
            <Download className="w-4 h-4" /> PDF
          </Button>
        </div>
      </div>

      <Card className="flex-1 bg-card border-border overflow-hidden flex flex-col min-h-[400px]">
        <CardContent className="p-6 flex-1 overflow-auto font-mono text-[15px] leading-relaxed whitespace-pre-wrap">
          {renderedContent}
        </CardContent>
      </Card>
    </div>
  );
}

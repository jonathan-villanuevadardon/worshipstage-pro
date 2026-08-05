import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Columns3, FileText, Printer, Type } from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF, printRepertoire } from '@/lib/repertoireUtils';
import {
  DEFAULT_PRINT_OPTIONS,
  PRINT_COLUMN_OPTIONS,
  PRINT_FONT_SIZE_OPTIONS,
} from '@/lib/repertoirePrintLayout.js';
import RepertoirePrintPreview from '@/components/RepertoirePrintPreview.jsx';

export default function RepertoireExportModal({ open, onClose, repertoire, songs }) {
  const [exporting, setExporting] = useState(false);
  const [printOptions, setPrintOptions] = useState(DEFAULT_PRINT_OPTIONS);

  const generatePDF = () => {
    try {
      setExporting(true);
      exportToPDF(repertoire, songs || [], printOptions);
      toast.success('PDF exportado respetando espacios, columnas y partes');
      onClose();
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('No fue posible generar el PDF');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      printRepertoire(repertoire, songs || [], printOptions);
      onClose();
    } catch (error) {
      if (error.message === 'PRINT_POPUP_BLOCKED') {
        toast.error('Permite las ventanas emergentes para imprimir.');
      } else {
        toast.error('No fue posible preparar la impresión.');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[94vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar PDF e impresión</DialogTitle>
          <DialogDescription>
            Cada canción comienza en una hoja nueva. Si ocupa varias hojas, se identifica como Parte 1, Parte 2 y así sucesivamente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-6 py-3">
          <div className="space-y-5">
            <div className="space-y-2">
            <Label htmlFor="print-columns" className="flex items-center gap-2">
              <Columns3 className="w-4 h-4" /> Columnas
            </Label>
            <Select
              value={String(printOptions.columns)}
              onValueChange={(value) => setPrintOptions((current) => ({ ...current, columns: Number(value) }))}
            >
              <SelectTrigger id="print-columns"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRINT_COLUMN_OPTIONS.map((columns) => (
                  <SelectItem key={columns} value={String(columns)}>
                    {columns} {columns === 1 ? 'columna' : 'columnas'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Más columnas ahorran papel en letras cortas.</p>
            </div>

            <div className="space-y-2">
            <Label htmlFor="print-font-size" className="flex items-center gap-2">
              <Type className="w-4 h-4" /> Tamaño de fuente
            </Label>
            <Select
              value={String(printOptions.fontSize)}
              onValueChange={(value) => setPrintOptions((current) => ({ ...current, fontSize: Number(value) }))}
            >
              <SelectTrigger id="print-font-size"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRINT_FONT_SIZE_OPTIONS.map((fontSize) => (
                  <SelectItem key={fontSize} value={String(fontSize)}>{fontSize} pt</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">La fuente monoespaciada conserva la posición de los acordes.</p>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              Formato seleccionado: <strong className="text-foreground">{printOptions.columns} columna{printOptions.columns === 1 ? '' : 's'}, fuente {printOptions.fontSize} pt</strong>.
              Los datos completos aparecen sólo en la Parte 1; las continuaciones muestran nombre, parte y pie de página.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 pt-2">
              <Button variant="outline" className="h-16 gap-2" onClick={generatePDF} disabled={exporting}>
                <FileText className="w-5 h-5 text-primary" />
                <span>Descargar PDF</span>
              </Button>
              <Button className="h-16 gap-2" onClick={handlePrint} disabled={exporting}>
                <Printer className="w-5 h-5" />
                <span>Imprimir</span>
              </Button>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} disabled={exporting}>Cancelar</Button>
            </DialogFooter>
          </div>

          <div className="w-full max-w-[520px] mx-auto lg:border-l lg:border-border lg:pl-6">
            <RepertoirePrintPreview
              key={`${printOptions.columns}-${printOptions.fontSize}-${songs?.length || 0}`}
              repertoire={repertoire}
              songs={songs}
              options={printOptions}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

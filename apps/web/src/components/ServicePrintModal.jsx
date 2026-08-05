import React, { useEffect, useMemo, useState } from 'react';
import { Columns3, FileText, Loader2, Printer, Type } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RepertoirePrintPreview from '@/components/RepertoirePrintPreview.jsx';
import {
  DEFAULT_PRINT_OPTIONS,
  PRINT_COLUMN_OPTIONS,
  PRINT_FONT_SIZE_OPTIONS,
} from '@/lib/repertoirePrintLayout.js';
import { createServicePrintContent } from '@/lib/servicePrintContent.js';
import { generateServicePdf, loadServicePrintData, printServicePdf } from '@/lib/servicePrint.js';

export default function ServicePrintModal({ open, onClose, service }) {
  const [printOptions, setPrintOptions] = useState(DEFAULT_PRINT_OPTIONS);
  const [printData, setPrintData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (!open || !service) return undefined;
    let active = true;
    setLoading(true);
    setPrintData(null);
    loadServicePrintData(service)
      .then((data) => {
        if (active) setPrintData(data);
      })
      .catch((error) => {
        console.error('Service print data failed:', error);
        if (active) toast.error('No fue posible cargar la hoja del servicio');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, service]);

  const content = useMemo(() => {
    if (!service || !printData) return null;
    return createServicePrintContent(service, printData.assignments, printData.repertoireSongs);
  }, [service, printData]);

  const handleDownload = async () => {
    try {
      setProcessing('download');
      await generateServicePdf(service, printOptions, printData);
      toast.success('PDF del servicio descargado');
    } catch (error) {
      console.error('Service PDF failed:', error);
      toast.error('No fue posible generar el PDF');
    } finally {
      setProcessing(null);
    }
  };

  const handlePrint = async () => {
    try {
      setProcessing('print');
      await printServicePdf(service, printOptions, printData);
    } catch (error) {
      console.error('Service print failed:', error);
      toast.error(error.message === 'PRINT_POPUP_BLOCKED'
        ? 'Permite las ventanas emergentes para imprimir.'
        : 'No fue posible preparar la impresión.');
    } finally {
      setProcessing(null);
    }
  };

  const unavailable = loading || !printData || Boolean(processing);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[94vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Imprimir o exportar hoja del servicio</DialogTitle>
          <DialogDescription>
            Usa el paginado optimizado, las tonalidades asignadas y el formato de acordes del repertorio.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 py-3 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="service-print-columns" className="flex items-center gap-2">
                <Columns3 className="h-4 w-4" /> Columnas
              </Label>
              <Select
                value={String(printOptions.columns)}
                onValueChange={(value) => setPrintOptions((current) => ({ ...current, columns: Number(value) }))}
              >
                <SelectTrigger id="service-print-columns"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRINT_COLUMN_OPTIONS.map((columns) => (
                    <SelectItem key={columns} value={String(columns)}>
                      {columns} {columns === 1 ? 'columna' : 'columnas'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-print-font" className="flex items-center gap-2">
                <Type className="h-4 w-4" /> Tamaño de fuente
              </Label>
              <Select
                value={String(printOptions.fontSize)}
                onValueChange={(value) => setPrintOptions((current) => ({ ...current, fontSize: Number(value) }))}
              >
                <SelectTrigger id="service-print-font"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRINT_FONT_SIZE_OPTIONS.map((fontSize) => (
                    <SelectItem key={fontSize} value={String(fontSize)}>{fontSize} pt</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <strong className="text-foreground">{printOptions.columns} columna{printOptions.columns === 1 ? '' : 's'}, {printOptions.fontSize} pt.</strong>{' '}
              La primera canción incluye fecha, hora, lugar y equipo asignado. Cada canción conserva sus partes y pie de página.
            </div>

            <div className="grid gap-3">
              <Button variant="outline" className="h-14 gap-2" onClick={handleDownload} disabled={unavailable}>
                {processing === 'download' ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5 text-primary" />}
                Descargar PDF
              </Button>
              <Button className="h-14 gap-2" onClick={handlePrint} disabled={unavailable}>
                {processing === 'print' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
                Imprimir
              </Button>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} disabled={Boolean(processing)}>Cerrar</Button>
            </DialogFooter>
          </div>

          <div className="mx-auto w-full max-w-[520px] lg:border-l lg:border-border lg:pl-6">
            {loading && (
              <div className="flex aspect-[210/297] items-center justify-center rounded-lg border bg-white text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparando vista previa...
              </div>
            )}
            {!loading && content?.songs.length > 0 && (
              <RepertoirePrintPreview
                key={`${service?.id}-${printOptions.columns}-${printOptions.fontSize}`}
                repertoire={content.repertoire}
                songs={content.songs}
                options={printOptions}
              />
            )}
            {!loading && content?.songs.length === 0 && (
              <div className="flex aspect-[210/297] flex-col items-center justify-center rounded-lg border bg-white p-8 text-center text-slate-600">
                <FileText className="mb-3 h-8 w-8" />
                <p className="font-medium">Servicio sin canciones</p>
                <p className="mt-1 text-sm">El PDF incluirá los datos del servicio y el equipo asignado.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createRepertoirePrintLayout } from '@/lib/repertoirePrintLayout.js';

export default function RepertoirePrintPreview({ repertoire, songs, options }) {
  const [pageIndex, setPageIndex] = useState(0);
  const pages = useMemo(() => {
    const layout = createRepertoirePrintLayout(repertoire, songs || [], options);
    return layout.songs.flatMap((songLayout) => (
      songLayout.pages.map((page) => ({ songLayout, page }))
    ));
  }, [repertoire, songs, options]);

  if (pages.length === 0) {
    return (
      <div className="aspect-[210/297] rounded-lg border border-border bg-white text-slate-500 flex items-center justify-center text-sm">
        No hay canciones para previsualizar.
      </div>
    );
  }

  const safePageIndex = Math.min(pageIndex, pages.length - 1);
  const { songLayout, page } = pages[safePageIndex];
  const partLabel = `${songLayout.order}. ${songLayout.title} - Parte ${page.part} de ${page.totalParts}`;
  const previewFontSize = Math.max(4.5, songLayout.metrics.fontSize * 0.58);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Vista previa</p>
          <p className="text-xs text-muted-foreground">Hoja {safePageIndex + 1} de {pages.length}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            disabled={safePageIndex === 0}
            aria-label="Hoja anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageIndex((current) => Math.min(pages.length - 1, current + 1))}
            disabled={safePageIndex === pages.length - 1}
            aria-label="Hoja siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        className="relative flex w-full flex-col overflow-hidden rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm"
        style={{ aspectRatio: '210 / 297', padding: '2% 5.7% 3.5%' }}
      >
        <div className="text-[5px] text-slate-500 leading-none mb-1">{repertoire?.name || 'Repertorio'}</div>
        <div className="text-[8px] font-bold leading-tight mb-1">{partLabel}</div>

        {page.part === 1 && (
          <>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0 border-y border-slate-200 py-0.5 text-[4.5px] leading-tight">
              <span>Orden <strong>{songLayout.order}</strong></span>
              <span>Duración <strong>{songLayout.duration}</strong></span>
              <span>Canción <strong>{songLayout.title}</strong></span>
              <span>Original <strong>{songLayout.originalKey || 'N/A'}</strong></span>
              <span>Asignado <strong>{songLayout.displayKey || songLayout.originalKey || 'N/A'}</strong></span>
              <strong>{songLayout.metrics.columns} col</strong>
              <strong>{songLayout.metrics.fontSize} pt</strong>
            </div>
            {songLayout.notes && <div className="text-[4.5px] leading-tight py-0.5">Notas: {songLayout.notes}</div>}
          </>
        )}

        <div
          className="mb-[3%] mt-1 grid min-h-0 flex-1 gap-[3%] overflow-hidden border-t border-slate-200 pt-1"
          style={{ gridTemplateColumns: `repeat(${songLayout.metrics.columns}, minmax(0, 1fr))` }}
        >
          {page.columns.map((columnLines, columnIndex) => (
            <pre
              key={columnIndex}
              className={`m-0 min-w-0 overflow-hidden whitespace-pre font-mono text-slate-900 ${columnIndex > 0 ? 'border-l border-slate-200 pl-1' : ''}`}
              style={{ fontSize: `${previewFontSize}px`, lineHeight: 1.18 }}
            >
              {columnLines.join('\n')}
            </pre>
          ))}
        </div>

        <div className="absolute bottom-[1.5%] left-[5.7%] right-[5.7%] flex justify-between gap-2 border-t border-slate-300 pt-1 text-[4.5px] text-slate-600">
          <strong className="truncate">{partLabel}</strong>
          <span className="shrink-0">Canción {songLayout.order}</span>
        </div>
      </div>
    </div>
  );
}

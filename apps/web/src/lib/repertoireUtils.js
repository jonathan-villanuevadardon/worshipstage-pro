import { jsPDF } from 'jspdf';
import { getRepertoireSongView } from './repertoireSongUtils.js';
import { createRepertoirePrintLayout, normalizePrintOptions } from './repertoirePrintLayout.js';

function safeFileName(value) {
  return String(value || 'repertoire').replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const calculateTotalDuration = (songs) => {
  if (!songs || !Array.isArray(songs)) return 0;
  return songs.reduce((total, song) => {
    const duration = song.expand?.song_id?.duration_seconds || song.duration_seconds || 0;
    return total + duration;
  }, 0);
};

export const formatDuration = (seconds) => {
  if (!seconds) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const exportToText = (repertoire, songs) => {
  let content = `${repertoire.name}\n`;
  content += `Service Type: ${repertoire.service_type}\n`;
  content += `Date: ${new Date(repertoire.created).toLocaleDateString()}\n`;
  content += `Total Duration: ${formatDuration(calculateTotalDuration(songs))}\n\n`;
  content += 'SONGS:\n----------------------------------------\n';

  songs.forEach((rs, index) => {
    const { song, originalKey, displayKey, content: chart } = getRepertoireSongView(rs);
    content += `${index + 1}. ${song.title || 'Unknown Song'} - ${song.artist || 'Unknown Artist'}\n`;
    if (displayKey) {
      content += `   Key: ${displayKey}${displayKey !== originalKey ? ` (original: ${originalKey || 'N/A'})` : ''}\n`;
    }
    if (rs.notes) content += `   Notes: ${rs.notes}\n`;
    content += chart ? `\n${chart}\n\n` : '\n   No chord chart saved for this song.\n\n';
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFileName(repertoire.name)}_repertoire.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function drawPdfSongPage(doc, repertoire, songLayout, page) {
  const { metrics } = songLayout;
  const isFirstPart = page.part === 1;
  const chartStart = isFirstPart ? metrics.firstStart : metrics.continuingStart;
  const partLabel = `${songLayout.order}. ${songLayout.title} - Parte ${page.part} de ${page.totalParts}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(repertoire.name || 'Repertorio', metrics.marginX, 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(partLabel, 186);
  doc.text(titleLines, metrics.marginX, 12);

  if (isFirstPart) {
    const metadataY = 18 + ((titleLines.length - 1) * 4);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(51, 65, 85);
    const compactMetadata = [
      `Orden ${songLayout.order}`,
      `Duración ${songLayout.duration}`,
      `Canción ${songLayout.title}`,
      `Original ${songLayout.originalKey || 'N/A'}`,
      `Asignado ${songLayout.displayKey || songLayout.originalKey || 'N/A'}`,
      `${metrics.columns} col`,
      `${metrics.fontSize} pt`,
    ].join('  |  ');
    const metadataLines = doc.splitTextToSize(compactMetadata, 186);
    doc.text(metadataLines, metrics.marginX, metadataY);

    if (songLayout.notes) {
      doc.setFontSize(6.2);
      const noteLines = doc.splitTextToSize(`Notas: ${songLayout.notes}`, 186);
      doc.text(noteLines, metrics.marginX, metadataY + (metadataLines.length * 3) + 1);
    }
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(metrics.marginX, chartStart - 3, 198, chartStart - 3);

  doc.setFont('courier', 'normal');
  doc.setFontSize(metrics.fontSize);
  doc.setTextColor(0, 0, 0);
  page.columns.forEach((columnLines, columnIndex) => {
    const x = metrics.marginX + (columnIndex * (metrics.columnWidth + metrics.columnGap));
    let y = chartStart;
    columnLines.forEach((line) => {
      doc.text(line || ' ', x, y);
      y += metrics.lineHeight;
    });
    if (columnIndex < metrics.columns - 1) {
      const dividerX = x + metrics.columnWidth + (metrics.columnGap / 2);
      doc.setDrawColor(226, 232, 240);
      doc.line(dividerX, chartStart, dividerX, metrics.footerTop - 3);
    }
  });

  doc.setDrawColor(148, 163, 184);
  doc.line(metrics.marginX, metrics.footerTop, 198, metrics.footerTop);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(partLabel, metrics.marginX, 289);
  doc.setFont('helvetica', 'normal');
  doc.text(`${repertoire.name || 'Repertorio'} | Canción ${songLayout.order}`, 198, 289, { align: 'right' });
}

export function buildRepertoirePDF(repertoire, songs, options = {}) {
  const layout = createRepertoirePrintLayout(repertoire, songs, options);
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  let hasPageContent = false;

  layout.songs.forEach((songLayout) => {
    songLayout.pages.forEach((page) => {
      if (hasPageContent) doc.addPage();
      drawPdfSongPage(doc, repertoire, songLayout, page);
      hasPageContent = true;
    });
  });

  if (!hasPageContent) {
    doc.setFontSize(16);
    doc.text(repertoire.name || 'Repertorio', 14, 22);
    doc.setFontSize(11);
    doc.text('No hay canciones en este repertorio.', 14, 34);
  }

  return doc;
}

export const exportToPDF = (repertoire, songs, options = {}) => {
  const doc = buildRepertoirePDF(repertoire, songs, options);
  doc.save(`${safeFileName(repertoire.name)}_repertoire.pdf`);
};

function renderPrintSheet(repertoire, songLayout, page) {
  const firstPart = page.part === 1;
  const partLabel = `${songLayout.order}. ${songLayout.title} - Parte ${page.part} de ${page.totalParts}`;
  const columns = page.columns.map((columnLines) => (
    `<pre>${escapeHtml(columnLines.join('\n'))}</pre>`
  )).join('');

  const metadata = firstPart ? `<div class="metadata">
    <div><span>Orden</span> <strong>${songLayout.order}</strong></div>
    <div><span>Duración</span> <strong>${escapeHtml(songLayout.duration)}</strong></div>
    <div><span>Canción</span> <strong>${escapeHtml(songLayout.title)}</strong></div>
    <div><span>Original</span> <strong>${escapeHtml(songLayout.originalKey || 'N/A')}</strong></div>
    <div><span>Asignado</span> <strong>${escapeHtml(songLayout.displayKey || songLayout.originalKey || 'N/A')}</strong></div>
    <div><strong>${songLayout.metrics.columns} col</strong></div>
    <div><strong>${songLayout.metrics.fontSize} pt</strong></div>
  </div>${songLayout.notes ? `<div class="notes"><strong>Notas:</strong> ${escapeHtml(songLayout.notes)}</div>` : ''}` : '';

  return `<section class="sheet" style="--columns:${songLayout.metrics.columns};--font-size:${songLayout.metrics.fontSize}pt;--line-height:${songLayout.metrics.lineHeight}mm">
    <header><div class="repertoire">${escapeHtml(repertoire.name || 'Repertorio')}</div><h1>${escapeHtml(partLabel)}</h1>${metadata}</header>
    <div class="chart">${columns}</div>
    <footer><strong>${escapeHtml(partLabel)}</strong><span>${escapeHtml(repertoire.name || 'Repertorio')} | Canción ${songLayout.order}</span></footer>
  </section>`;
}

export const printRepertoire = (repertoire, songs, options = {}) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) throw new Error('PRINT_POPUP_BLOCKED');
  const layout = createRepertoirePrintLayout(repertoire, songs, normalizePrintOptions(options));
  const sheets = layout.songs.flatMap((songLayout) => (
    songLayout.pages.map((page) => renderPrintSheet(repertoire, songLayout, page))
  )).join('');

  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(repertoire.name)}</title><style>
    @page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;color:#0f172a;background:#fff;font-family:Arial,sans-serif}
    .sheet{width:210mm;height:297mm;padding:6mm 12mm 8mm;position:relative;display:flex;flex-direction:column;page-break-after:always;overflow:hidden}
    .sheet:last-child{page-break-after:auto}.repertoire{font-size:6pt;color:#64748b;margin-bottom:1mm}h1{font-size:11pt;line-height:1.1;margin:0 0 1.5mm}
    .metadata{display:flex;align-items:center;flex-wrap:wrap;gap:.7mm 3mm;padding:1mm 0;border-top:.2mm solid #cbd5e1;border-bottom:.2mm solid #cbd5e1;font-size:6.5pt;line-height:1.1}
    .metadata span{color:#64748b}.metadata strong{white-space:nowrap}.notes{font-size:6.2pt;padding:1mm 0;color:#334155}
    .chart{display:grid;grid-template-columns:repeat(var(--columns),minmax(0,1fr));gap:6mm;flex:1;min-height:0;margin-bottom:8mm;padding-top:2mm;border-top:.25mm solid #cbd5e1;overflow:hidden}
    .chart pre{margin:0;min-width:0;overflow:hidden;white-space:pre;font-family:"Courier New",Courier,monospace;font-size:var(--font-size);line-height:var(--line-height)}
    .chart pre+pre{border-left:.2mm solid #e2e8f0;padding-left:3mm}footer{position:absolute;left:12mm;right:12mm;bottom:3.5mm;border-top:.25mm solid #94a3b8;padding-top:1.5mm;display:flex;justify-content:space-between;gap:5mm;font-size:8pt;color:#475569}
    @media screen{body{background:#e2e8f0;padding:10mm 0}.sheet{margin:0 auto 10mm;background:#fff;box-shadow:0 2mm 8mm rgba(15,23,42,.18)}}
  </style></head><body>${sheets || '<section class="sheet"><h1>No hay canciones en este repertorio.</h1></section>'}<script>window.onload=()=>{window.print();window.close()}</script></body></html>`);
  printWindow.document.close();
};

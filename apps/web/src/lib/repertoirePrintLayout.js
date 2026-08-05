import { getRepertoireSongView } from './repertoireSongUtils.js';

export const DEFAULT_PRINT_OPTIONS = Object.freeze({ columns: 2, fontSize: 9 });
export const PRINT_COLUMN_OPTIONS = [1, 2, 3];
export const PRINT_FONT_SIZE_OPTIONS = [7, 8, 9, 10, 11, 12, 14];

const MM_PER_POINT = 25.4 / 72;
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_MM = 210;
const HORIZONTAL_MARGIN_MM = 12;
const COLUMN_GAP_MM = 6;
const FOOTER_TOP_MM = 287;
const CHART_FOOTER_CLEARANCE_MM = 1.5;

function formatSongDuration(seconds) {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function normalizePrintOptions(options = {}) {
  const columns = PRINT_COLUMN_OPTIONS.includes(Number(options.columns))
    ? Number(options.columns)
    : DEFAULT_PRINT_OPTIONS.columns;
  const fontSize = PRINT_FONT_SIZE_OPTIONS.includes(Number(options.fontSize))
    ? Number(options.fontSize)
    : DEFAULT_PRINT_OPTIONS.fontSize;
  return { columns, fontSize };
}

export function expandTabs(line, tabSize = 4) {
  let result = '';
  for (const character of String(line || '')) {
    if (character !== '\t') {
      result += character;
      continue;
    }
    const spaces = tabSize - (result.length % tabSize);
    result += ' '.repeat(spaces);
  }
  return result;
}

export function wrapChartPreservingSpacing(content, maxCharacters) {
  const width = Math.max(1, Number(maxCharacters) || 1);
  const sourceLines = String(content || '').split(/\r\n|\r|\n|\u2028|\u2029/);
  const lines = [];

  sourceLines.forEach((sourceLine) => {
    const line = expandTabs(sourceLine);
    if (!line.length) {
      lines.push('');
      return;
    }
    for (let index = 0; index < line.length; index += width) {
      lines.push(line.slice(index, index + width));
    }
  });

  return lines;
}

function estimateChartStart(songTitle, notes, firstPart) {
  const titleLength = String(songTitle || '').length;
  const titleLines = Math.max(1, Math.ceil((titleLength + 30) / 80));
  const titleLastBaseline = 12 + ((titleLines - 1) * 4);
  if (!firstPart) return titleLastBaseline + 6;

  const metadataLines = Math.max(1, Math.ceil((titleLength + 90) / 180));
  const metadataY = 18 + ((titleLines - 1) * 4);
  let lastHeaderBaseline = metadataY + ((metadataLines - 1) * 3);

  if (notes) {
    const noteLines = Math.max(1, Math.ceil((String(notes).length + 7) / 190));
    const notesY = metadataY + (metadataLines * 3) + 1;
    lastHeaderBaseline = notesY + ((noteLines - 1) * 3);
  }

  return lastHeaderBaseline + 6;
}

export function calculatePrintMetrics(options = {}, songTitle = '', notes = '') {
  const normalized = normalizePrintOptions(options);
  const usableWidth = PAGE_WIDTH_MM - (HORIZONTAL_MARGIN_MM * 2);
  const totalGaps = COLUMN_GAP_MM * (normalized.columns - 1);
  const columnWidth = (usableWidth - totalGaps) / normalized.columns;
  const characterWidth = normalized.fontSize * 0.62 * MM_PER_POINT;
  const lineHeight = normalized.fontSize * 1.08 * MM_PER_POINT;
  const maxCharacters = Math.max(12, Math.floor((columnWidth - 2) / characterWidth));
  const firstStart = estimateChartStart(songTitle, notes, true);
  const continuingStart = estimateChartStart(songTitle, '', false);
  const linesPerColumn = (start) => Math.max(
    1,
    Math.floor((FOOTER_TOP_MM - CHART_FOOTER_CLEARANCE_MM - start) / lineHeight) + 1
  );

  return {
    ...normalized,
    pageHeight: PAGE_HEIGHT_MM,
    pageWidth: PAGE_WIDTH_MM,
    marginX: HORIZONTAL_MARGIN_MM,
    columnGap: COLUMN_GAP_MM,
    columnWidth,
    lineHeight,
    maxCharacters,
    footerTop: FOOTER_TOP_MM,
    firstStart,
    continuingStart,
    firstLinesPerColumn: linesPerColumn(firstStart),
    continuingLinesPerColumn: linesPerColumn(continuingStart),
  };
}

function findNaturalColumnEnd(lines, start, linesPerColumn) {
  const hardEnd = Math.min(lines.length, start + linesPerColumn);
  if (hardEnd >= lines.length) return hardEnd;

  const earliestNaturalEnd = start + Math.floor(linesPerColumn * 0.62);
  const sectionHeading = /^\s*(?:INTRO|VERSO|ESTROFA|PRECORO|CORO|PUENTE|FINAL|OUTRO|INTERLUDIO)(?:\s|\d|$)/i;
  for (let index = hardEnd; index >= earliestNaturalEnd; index -= 1) {
    if (sectionHeading.test(lines[index] || '')) return index;
  }
  for (let index = hardEnd; index >= earliestNaturalEnd; index -= 1) {
    if (lines[index - 1] === '') return index;
  }
  return hardEnd;
}

export function paginateChartLines(lines, metrics) {
  const pages = [];
  let offset = 0;
  let part = 1;

  do {
    const linesPerColumn = part === 1
      ? metrics.firstLinesPerColumn
      : metrics.continuingLinesPerColumn;
    const pageCapacity = linesPerColumn * metrics.columns;
    const requiresAnotherPage = (lines.length - offset) > pageCapacity;
    const columns = [];
    for (let columnIndex = 0; columnIndex < metrics.columns; columnIndex += 1) {
      if (offset >= lines.length) {
        columns.push([]);
        continue;
      }
      // When another page is unavoidable, consume the complete printable area
      // before adding a page. Natural section boundaries remain useful on the
      // final page, where they do not create an unnecessary page break.
      const hardEnd = Math.min(lines.length, offset + linesPerColumn);
      let columnEnd = hardEnd;
      if (!requiresAnotherPage) {
        const naturalEnd = findNaturalColumnEnd(lines, offset, linesPerColumn);
        const remainingColumns = metrics.columns - columnIndex - 1;
        const remainingCapacity = remainingColumns * linesPerColumn;
        const remainingAfterNaturalBreak = lines.length - naturalEnd;

        // A semantic break is allowed only when the rest still fits in the
        // columns left on this page. Otherwise it would create a nearly empty
        // continuation page even though the content physically fits here.
        if (remainingAfterNaturalBreak <= remainingCapacity) {
          columnEnd = naturalEnd;
        }
      }
      columns.push(lines.slice(offset, columnEnd));
      offset = columnEnd;
    }
    pages.push({
      part,
      linesPerColumn,
      columns,
    });
    part += 1;
  } while (offset < lines.length);

  return pages;
}

export function createSongPrintLayout(repertoireSong, songIndex, options = {}) {
  const view = getRepertoireSongView(repertoireSong);
  const title = view.song.title || 'Canción sin título';
  const metrics = calculatePrintMetrics(options, title, repertoireSong.notes || '');
  const chartContent = view.content || 'No hay letras o acordes guardados para esta canción.';
  const lines = wrapChartPreservingSpacing(chartContent, metrics.maxCharacters);
  const pages = paginateChartLines(lines, metrics);
  const totalParts = pages.length;

  return {
    ...view,
    order: songIndex + 1,
    title,
    duration: formatSongDuration(view.song.duration_seconds),
    notes: repertoireSong.notes || '',
    metrics,
    pages: pages.map((page) => ({ ...page, totalParts })),
  };
}

export function createRepertoirePrintLayout(repertoire, songs, options = {}) {
  const normalized = normalizePrintOptions(options);
  return {
    repertoire,
    options: normalized,
    songs: songs.map((song, index) => createSongPrintLayout(song, index, normalized)),
  };
}

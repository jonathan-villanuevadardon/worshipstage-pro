import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePrintMetrics,
  createRepertoirePrintLayout,
  expandTabs,
  normalizePrintOptions,
  paginateChartLines,
  wrapChartPreservingSpacing,
} from './repertoirePrintLayout.js';
import { buildRepertoirePDF } from './repertoireUtils.js';
import { jsPDF } from 'jspdf';

function repertoireSong(overrides = {}) {
  return {
    id: 'rep-song-1',
    key_adjustment: 'D',
    notes: 'Entrada suave',
    expand: {
      song_id: {
        id: 'song-1',
        title: 'Alaba',
        key: 'C',
        duration_seconds: 245,
        chords: '[C]Cristo me ama\n    [G]Él me salvó',
      },
    },
    ...overrides,
  };
}

test('expands tabs without moving the following chord off its tab stop', () => {
  assert.equal(expandTabs('C\tG\tAm'), 'C   G   Am');
});

test('preserves leading spaces and blank lines while wrapping only long lines', () => {
  assert.deepEqual(
    wrapChartPreservingSpacing('    C  G\n\n123456789', 5),
    ['    C', '  G', '', '12345', '6789']
  );
});

test('treats Unicode line and paragraph separators as real line breaks', () => {
  assert.deepEqual(
    wrapChartPreservingSpacing('G\u2028Alabe a Dios\u2029Am', 40),
    ['G', 'Alabe a Dios', 'Am']
  );
});

test('creates the selected number of columns and numbered continuation parts', () => {
  const metrics = {
    columns: 2,
    firstLinesPerColumn: 2,
    continuingLinesPerColumn: 3,
  };
  const pages = paginateChartLines(['1', '2', '3', '4', '5', '6', '7', '8', '9'], metrics);
  assert.equal(pages.length, 2);
  assert.deepEqual(pages[0].columns, [['1', '2'], ['3', '4']]);
  assert.deepEqual(pages[1].columns, [['5', '6', '7'], ['8', '9']]);
  assert.deepEqual(pages.map(({ part }) => part), [1, 2]);
});

test('prefers blank-line boundaries so sections are not split between columns', () => {
  const metrics = { columns: 2, firstLinesPerColumn: 5, continuingLinesPerColumn: 5 };
  const pages = paginateChartLines(['A', 'B', 'C', '', 'D', 'E', 'F', 'G'], metrics);
  assert.deepEqual(pages[0].columns, [['A', 'B', 'C', ''], ['D', 'E', 'F', 'G']]);
});

test('prefers named song sections over a closer generic blank line', () => {
  const metrics = { columns: 2, firstLinesPerColumn: 6, continuingLinesPerColumn: 6 };
  const lines = ['A', 'B', '', 'CORO', 'C', 'D', '', 'E', 'F'];
  const pages = paginateChartLines(lines, metrics);
  assert.deepEqual(pages[0].columns[0], ['A', 'B', '']);
  assert.equal(pages[0].columns[1][0], 'CORO');
});

test('normalizes column and font controls to supported values', () => {
  assert.deepEqual(normalizePrintOptions({ columns: 3, fontSize: 12 }), { columns: 3, fontSize: 12 });
  assert.deepEqual(normalizePrintOptions({ columns: 8, fontSize: 30 }), { columns: 2, fontSize: 9 });
});

test('starts every song at part 1 and retains repertoire-only transposition', () => {
  const longChart = Array.from({ length: 300 }, (_, index) => `[C]Línea ${index + 1}`).join('\n');
  const firstSong = repertoireSong({
    expand: { song_id: { title: 'Alaba', key: 'C', chords: longChart, duration_seconds: 245 } },
  });
  const secondSong = repertoireSong({
    id: 'rep-song-2',
    key_adjustment: '',
    expand: { song_id: { title: 'Gracia', key: 'G', chords: '[G]Original', duration_seconds: 180 } },
  });
  const layout = createRepertoirePrintLayout({ name: 'Domingo' }, [firstSong, secondSong], { columns: 1, fontSize: 14 });

  assert.ok(layout.songs[0].pages.length > 1);
  assert.equal(layout.songs[0].pages[0].part, 1);
  assert.equal(layout.songs[1].pages[0].part, 1);
  assert.equal(layout.songs[0].displayKey, 'D');
  assert.match(layout.songs[0].content, /^\[D\]/);
  assert.equal(layout.songs[1].content, '[G]Original');
});

test('builds one PDF page per calculated song part', () => {
  const longChart = Array.from({ length: 240 }, (_, index) => `C G Am F  línea ${index + 1}`).join('\n');
  const songs = [repertoireSong({
    expand: { song_id: { title: 'Alaba', key: 'C', chords: longChart, duration_seconds: 245 } },
  })];
  const options = { columns: 2, fontSize: 10 };
  const layout = createRepertoirePrintLayout({ name: 'Domingo' }, songs, options);
  const doc = buildRepertoirePDF({ name: 'Domingo' }, songs, options);

  assert.equal(doc.getNumberOfPages(), layout.songs[0].pages.length);
  assert.ok(doc.output('arraybuffer').byteLength > 1_000);
});

test('larger fonts reduce line capacity without changing the configured columns', () => {
  const small = calculatePrintMetrics({ columns: 3, fontSize: 7 }, 'Alaba', '');
  const large = calculatePrintMetrics({ columns: 3, fontSize: 14 }, 'Alaba', '');
  assert.equal(small.columns, 3);
  assert.equal(large.columns, 3);
  assert.ok(small.firstLinesPerColumn > large.firstLinesPerColumn);
  assert.ok(small.maxCharacters > large.maxCharacters);
});

test('every wrapped line fits inside the physical PDF column width', () => {
  const metrics = calculatePrintMetrics({ columns: 2, fontSize: 9 }, 'Alaba', '');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  doc.setFont('courier', 'normal');
  doc.setFontSize(metrics.fontSize);
  const lines = wrapChartPreservingSpacing(
    '// Q u e   t o d a   l a   C r e a c i ó n \u2028 Alabe a Dios Alabe al Señor',
    metrics.maxCharacters
  );
  assert.ok(lines.every((line) => doc.getTextWidth(line) <= metrics.columnWidth));
});

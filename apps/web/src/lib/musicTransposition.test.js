import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import {
  clampSemitones,
  detectKey,
  findSimplestCapo,
  getChordKey,
  getSemitoneDifference,
  getVisualTransposition,
  isChordLine,
  keyToIndex,
  normalizeCapo,
  parseChords,
  transposeChord,
  transposeKey,
  transposeLine,
  transposeSong,
} from './musicTransposition.js';

const inlineExample = '[C]Cristo me ama\n[G]Él me salvó\n[Am]Su gracia me alcanzó';

test('detecta acordes dentro de la letra usando corchetes', () => {
  assert.deepEqual(parseChords(inlineExample).map(({ chord }) => chord), ['C', 'G', 'Am']);
  assert.equal(detectKey(inlineExample), 'C');
});

test('soporta todas las familias de acordes requeridas', () => {
  const expected = [
    'C', 'D', 'E', 'F', 'G', 'A', 'B',
    'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
    'C7', 'Cm7', 'Cmaj7',
    'Cadd9', 'Csus2', 'Csus4', 'C6', 'C9', 'C11', 'C13',
    'Cdim', 'Caug', 'C7b5', 'C7#5',
    'C/E', 'G/B', 'D/F#',
  ];
  const text = expected.map((chord) => `[${chord}]Texto`).join('\n');
  assert.deepEqual(parseChords(text).map(({ chord }) => chord), expected);
});

test('reconoce equivalentes con sostenidos y bemoles', () => {
  assert.equal(keyToIndex('C#'), keyToIndex('Db'));
  assert.equal(keyToIndex('D#'), keyToIndex('Eb'));
  assert.equal(keyToIndex('F#'), keyToIndex('Gb'));
  assert.equal(keyToIndex('G#'), keyToIndex('Ab'));
  assert.equal(keyToIndex('A#'), keyToIndex('Bb'));
});

test('ignora anotaciones y palabras que no son acordes', () => {
  const text = '[Verso 1]\n[Puente]\nCristo me ama\n[C]Final';
  assert.deepEqual(parseChords(text).map(({ chord }) => chord), ['C']);
  assert.equal(isChordLine('Canto con amor'), false);
});

test('mantiene compatibilidad con líneas exclusivas de acordes', () => {
  const text = '|C|G/B|Am7|Fmaj7|';
  assert.equal(isChordLine(text), true);
  assert.deepEqual(parseChords(text).map(({ chord }) => chord), ['C', 'G/B', 'Am7', 'Fmaj7']);
});

test('transpone acordes simples, extendidos, alterados y slash chords', () => {
  assert.equal(transposeChord('C', 2), 'D');
  assert.equal(transposeChord('Cm7', 2), 'Dm7');
  assert.equal(transposeChord('Cmaj7', 2), 'Dmaj7');
  assert.equal(transposeChord('Cadd9', 2), 'Dadd9');
  assert.equal(transposeChord('Csus4', 2), 'Dsus4');
  assert.equal(transposeChord('C7b5', 2), 'D7b5');
  assert.equal(transposeChord('C7#5', 2), 'D7#5');
  assert.equal(transposeChord('D/F#', 2), 'E/G#');
});

test('transpone desde -12 hasta +12 semitonos', () => {
  assert.equal(clampSemitones(-40), -12);
  assert.equal(clampSemitones(40), 12);
  assert.equal(transposeChord('C', -12), 'C');
  assert.equal(transposeChord('C', 12), 'C');
  assert.equal(transposeChord('C', -1), 'B');
  assert.equal(transposeChord('B', 1), 'C');
});

test('preserva letras, anotaciones, espacios y saltos de línea', () => {
  const original = '[Intro]\r\n[C]Cristo  me ama\r\n\r\n[G/B]Él me salvó';
  const expected = '[Intro]\r\n[D]Cristo  me ama\r\n\r\n[A/C#]Él me salvó';
  assert.equal(transposeSong(original, 2), expected);
});

test('puede mostrar sostenidos o bemoles', () => {
  assert.equal(transposeChord('C', 1, 'sharps'), 'C#');
  assert.equal(transposeChord('C', 1, 'flats'), 'Db');
  assert.equal(transposeLine('[F#]Texto', 0, 'flats'), '[Gb]Texto');
});

test('calcula la tonalidad destino y su diferencia de semitonos', () => {
  assert.equal(getSemitoneDifference('C', 'D'), 2);
  assert.equal(getSemitoneDifference('C', 'B'), -1);
  assert.equal(getSemitoneDifference('Bb', 'C'), 2);
  assert.equal(transposeKey('C', getSemitoneDifference('C', 'D')), 'D');
  assert.equal(getChordKey('Bbmaj7'), 'Bb');
});

test('calcula capo, tonalidad real y tonalidad visual', () => {
  assert.equal(normalizeCapo(-1), 0);
  assert.equal(normalizeCapo(15), 12);
  const realTransposition = getSemitoneDifference('C', 'D');
  const visualTransposition = getVisualTransposition(realTransposition, 2);
  assert.equal(transposeKey('C', realTransposition), 'D');
  assert.equal(transposeKey('C', visualTransposition), 'C');
  assert.equal(transposeSong(inlineExample, visualTransposition), inlineExample);
});

test('recomienda un capo que simplifica acordes complejos', () => {
  const realTransposition = getSemitoneDifference('C', 'Db');
  assert.equal(findSimplestCapo(inlineExample, realTransposition, 'flats'), 1);
});

test('conserva soporte para nombres de notas latinos', () => {
  assert.equal(transposeChord('Rem7/La', 2), 'Mim7/Si');
});

test('procesa instantáneamente canciones de más de 500 líneas', () => {
  const longSong = Array.from({ length: 750 }, (_, index) => `[C]Línea ${index + 1}`).join('\n');
  const startedAt = performance.now();
  const result = transposeSong(longSong, 2);
  const elapsed = performance.now() - startedAt;

  assert.equal(parseChords(longSong).length, 750);
  assert.equal(result.split('\n').length, 750);
  assert.match(result, /^\[D\]Línea 1/);
  assert.ok(elapsed < 500, `La transposición tardó ${elapsed.toFixed(2)} ms`);
});

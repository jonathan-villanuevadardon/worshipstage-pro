export const SHARP_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const ALL_KEYS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];

const SPANISH_SHARPS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const SPANISH_FLATS = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];
const SIMPLE_PITCHES = new Set([0, 2, 4, 5, 7, 9, 11]);

const NATURAL_NOTE_INDEX = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
  Do: 0,
  Re: 2,
  Mi: 4,
  Fa: 5,
  Sol: 7,
  La: 9,
  Si: 11,
};

const ROOT_PATTERN = '(?:Sol|Do|Re|Mi|Fa|La|Si|[A-G])(?:#|b|\\u266f|\\u266d)?';
const ALTERATION_PATTERN = '(?:add9|sus2|sus4|b5|#5)';
const MODIFIER_PATTERN = `(?:(?:maj|min|m|M|dim|aug)?(?:2|5|6|7|9|11|13)?(?:${ALTERATION_PATTERN})*(?:\\(${ALTERATION_PATTERN}\\))*(?:/9)?)`;
const CHORD_PATTERN = `${ROOT_PATTERN}${MODIFIER_PATTERN}(?:/${ROOT_PATTERN})?`;

const CHORD_TOKEN_REGEX = new RegExp(`^${CHORD_PATTERN}$`);
const CHORD_PARTS_REGEX = new RegExp(`^(${ROOT_PATTERN})(${MODIFIER_PATTERN})(?:/(${ROOT_PATTERN}))?$`);
const BRACKETED_CHORD_SOURCE = `\\[(${CHORD_PATTERN})\\]`;
const chordCache = new Map();

function normalizeAccidentals(value) {
  return value.replace(/\u266f/g, '#').replace(/\u266d/g, 'b');
}

function parseNote(note) {
  const normalized = normalizeAccidentals(note);
  const match = normalized.match(/^(Sol|Do|Re|Mi|Fa|La|Si|[A-G])([#b]?)$/);
  if (!match) return null;

  const [, natural, accidental] = match;
  const offset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return {
    index: ((NATURAL_NOTE_INDEX[natural] + offset) % 12 + 12) % 12,
    spanish: natural.length > 1,
  };
}

function keyForIndex(index, notationMode = 'sharps', spanish = false) {
  const normalizedIndex = ((index % 12) + 12) % 12;
  if (spanish) return notationMode === 'flats' ? SPANISH_FLATS[normalizedIndex] : SPANISH_SHARPS[normalizedIndex];
  return notationMode === 'flats' ? FLAT_KEYS[normalizedIndex] : SHARP_KEYS[normalizedIndex];
}

function transposeNote(note, semitones, notationMode = 'sharps') {
  const parsed = parseNote(note);
  if (!parsed) return note;
  return keyForIndex(parsed.index + semitones, notationMode, parsed.spanish);
}

function linesWithEndings(text) {
  const lines = [];
  for (const match of text.matchAll(/[^\r\n]*(?:\r\n|\r|\n|$)/g)) {
    if (!match[0]) continue;
    const ending = match[0].match(/(?:\r\n|\r|\n)$/)?.[0] || '';
    lines.push({
      content: ending ? match[0].slice(0, -ending.length) : match[0],
      ending,
      offset: match.index,
    });
  }
  return lines;
}

function unwrapChordToken(token) {
  if (CHORD_TOKEN_REGEX.test(token)) return { chord: token, wrapper: '' };
  if (token.startsWith('(') && token.endsWith(')')) {
    const inner = token.slice(1, -1);
    if (CHORD_TOKEN_REGEX.test(inner)) return { chord: inner, wrapper: 'parentheses' };
  }
  return null;
}

function bareChordMatches(line) {
  return [...line.matchAll(/[^\s|,;:]+/g)];
}

export function clampSemitones(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(-12, Math.min(12, Math.round(numericValue)));
}

export function normalizeCapo(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.min(12, Math.round(numericValue)));
}

export function keyToIndex(key) {
  return parseNote(key)?.index ?? -1;
}

export function transposeKey(key, semitones, notationMode = 'sharps') {
  const parsed = parseNote(key);
  if (!parsed) return key;
  return keyForIndex(parsed.index + semitones, notationMode, false);
}

export function getSemitoneDifference(sourceKey, destinationKey) {
  const sourceIndex = keyToIndex(sourceKey);
  const destinationIndex = keyToIndex(destinationKey);
  if (sourceIndex === -1 || destinationIndex === -1) return 0;

  let difference = destinationIndex - sourceIndex;
  if (difference > 6) difference -= 12;
  if (difference < -6) difference += 12;
  return difference;
}

export function getVisualTransposition(realTransposition, capo) {
  return Number(realTransposition || 0) - normalizeCapo(capo);
}

/** Returns true only when every meaningful token in a bare line is a chord. */
export function isChordLine(line) {
  const matches = bareChordMatches(line);
  return matches.length > 0 && matches.every((match) => Boolean(unwrapChordToken(match[0])));
}

/** Transposes a single supported chord while leaving every modifier intact. */
export function transposeChord(chord, semitones, notationMode = 'sharps') {
  const cacheKey = `${chord}_${semitones}_${notationMode}`;
  if (chordCache.has(cacheKey)) return chordCache.get(cacheKey);

  const normalizedChord = normalizeAccidentals(chord);
  const match = normalizedChord.match(CHORD_PARTS_REGEX);
  if (!match) return chord;

  const [, root, modifier, bass = ''] = match;
  const result = `${transposeNote(root, semitones, notationMode)}${modifier}${bass ? `/${transposeNote(bass, semitones, notationMode)}` : ''}`;
  chordCache.set(cacheKey, result);
  return result;
}

/** Detects bracketed inline chords and bare chords placed on chord-only lines. */
export function parseChords(text) {
  if (!text) return [];

  const chords = [];
  for (const line of linesWithEndings(text)) {
    const bracketMatches = [...line.content.matchAll(new RegExp(BRACKETED_CHORD_SOURCE, 'g'))];
    if (bracketMatches.length > 0) {
      bracketMatches.forEach((match) => chords.push({
        chord: match[1],
        position: line.offset + match.index,
        fullMatch: match[0],
      }));
      continue;
    }

    if (!isChordLine(line.content)) continue;
    for (const match of bareChordMatches(line.content)) {
      const token = unwrapChordToken(match[0]);
      if (!token) continue;
      chords.push({
        chord: token.chord,
        position: line.offset + match.index + (token.wrapper ? 1 : 0),
        fullMatch: token.chord,
      });
    }
  }
  return chords;
}

/** Transposes supported chords while preserving lyrics, annotations, spacing and line endings. */
export function transposeLine(line, semitones, notationMode = 'sharps') {
  let bracketedCount = 0;
  const bracketedResult = line.replace(new RegExp(BRACKETED_CHORD_SOURCE, 'g'), (_match, chord) => {
    bracketedCount += 1;
    return `[${transposeChord(chord, semitones, notationMode)}]`;
  });
  if (bracketedCount > 0 || !isChordLine(line)) return bracketedResult;

  return line.replace(/[^\s|,;:]+/g, (rawToken) => {
    const token = unwrapChordToken(rawToken);
    if (!token) return rawToken;
    const transposed = transposeChord(token.chord, semitones, notationMode);
    return token.wrapper === 'parentheses' ? `(${transposed})` : transposed;
  });
}

export function transposeSong(songText, semitones, notationMode = 'sharps') {
  if (!songText) return '';
  return linesWithEndings(songText)
    .map((line) => `${transposeLine(line.content, semitones, notationMode)}${line.ending}`)
    .join('');
}

export function getChordKey(chord) {
  const root = normalizeAccidentals(chord || '').match(CHORD_PARTS_REGEX)?.[1];
  const parsed = root ? parseNote(root) : null;
  if (!parsed) return 'C';
  return root.includes('b') ? FLAT_KEYS[parsed.index] : SHARP_KEYS[parsed.index];
}

/** Uses the first valid chord as the most likely original key. */
export function detectKey(songText) {
  const firstChord = parseChords(songText)[0]?.chord;
  return firstChord ? getChordKey(firstChord) : 'C';
}

function chordComplexity(chord) {
  const match = normalizeAccidentals(chord).match(CHORD_PARTS_REGEX);
  if (!match) return 100;
  const [, root, , bass = ''] = match;
  const rootNote = parseNote(root);
  const bassNote = bass ? parseNote(bass) : null;
  let score = SIMPLE_PITCHES.has(rootNote?.index) ? 0 : 4;
  if (/[#b]/.test(root)) score += 2;
  if (bassNote && !SIMPLE_PITCHES.has(bassNote.index)) score += 2;
  if (bass && /[#b]/.test(bass)) score += 1;
  return score;
}

/** Finds the capo position that produces the simplest visible chord shapes. */
export function findSimplestCapo(songText, realTransposition, notationMode = 'sharps') {
  const uniqueChords = [...new Set(parseChords(songText).map(({ chord }) => chord))];
  if (uniqueChords.length === 0) return 0;

  let bestCapo = 0;
  let bestScore = Number.POSITIVE_INFINITY;
  for (let capo = 0; capo <= 11; capo += 1) {
    const visualTransposition = getVisualTransposition(realTransposition, capo);
    const score = uniqueChords.reduce(
      (total, chord) => total + chordComplexity(transposeChord(chord, visualTransposition, notationMode)),
      capo * 0.01
    );
    if (score < bestScore) {
      bestScore = score;
      bestCapo = capo;
    }
  }
  return bestCapo;
}

export function formatChordDisplay(chord, notationMode = 'sharps') {
  return transposeChord(chord, 0, notationMode);
}

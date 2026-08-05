const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const SPANISH_SHARPS = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const SPANISH_FLATS = ['Do', 'Reb', 'Re', 'Mib', 'Mi', 'Fa', 'Solb', 'Sol', 'Lab', 'La', 'Sib', 'Si'];

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

const ROOT_PATTERN = '(?:Sol|Do|Re|Mi|Fa|La|Si|[A-G])(?:#|b|♯|♭)?';
const MODIFIER_PATTERN = '(?:(?:maj|min|dim|aug|sus|add|omit|no|m|M|Δ|°|ø)?\\d{0,2}(?:(?:maj|add|sus|#|b)\\d+)*(?:\\([^\\s()]+\\))?)';
const CHORD_PATTERN = `${ROOT_PATTERN}${MODIFIER_PATTERN}(?:/(?:${ROOT_PATTERN}|\\d{1,2}))?`;
const CHORD_TOKEN_REGEX = new RegExp(`^${CHORD_PATTERN}$`);
const BRACKETED_CHORD_REGEX = new RegExp(`\\[(${CHORD_PATTERN})\\]`, 'g');
const chordCache = new Map();

function normalizeAccidentals(value) {
  return value.replace(/♯/g, '#').replace(/♭/g, 'b');
}

function parseNote(note) {
  const normalized = normalizeAccidentals(note);
  const match = normalized.match(/^(Sol|Do|Re|Mi|Fa|La|Si|[A-G])([#b]?)$/);
  if (!match) return null;

  const [, natural, accidental] = match;
  const naturalIndex = NATURAL_NOTE_INDEX[natural];
  const offset = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0;
  return {
    index: ((naturalIndex + offset) % 12 + 12) % 12,
    spanish: natural.length > 1,
  };
}

function transposeNote(note, semitones, notationMode = 'sharps') {
  const parsed = parseNote(note);
  if (!parsed) return note;

  const newIndex = ((parsed.index + semitones) % 12 + 12) % 12;
  if (parsed.spanish) {
    return notationMode === 'flats' ? SPANISH_FLATS[newIndex] : SPANISH_SHARPS[newIndex];
  }
  return notationMode === 'flats' ? FLATS[newIndex] : SHARPS[newIndex];
}

function unwrapChordToken(token) {
  const markerMatch = token.match(/^([|,;:]*)(.*?)([|,;:]*)$/);
  if (!markerMatch) return null;
  const [, prefix, candidate, suffix] = markerMatch;

  if (CHORD_TOKEN_REGEX.test(candidate)) return { prefix, chord: candidate, suffix, wrapper: '' };
  if (candidate.startsWith('(') && candidate.endsWith(')')) {
    const inner = candidate.slice(1, -1);
    if (CHORD_TOKEN_REGEX.test(inner)) return { prefix, chord: inner, suffix, wrapper: 'parentheses' };
  }
  return null;
}

function bareChordMatches(line) {
  return [...line.matchAll(/[^\s|,;:]+/g)];
}

/** Returns true only when every meaningful token in a line is a chord. */
export function isChordLine(line) {
  const meaningfulTokens = bareChordMatches(line);
  return meaningfulTokens.length > 0 && meaningfulTokens.every((match) => Boolean(unwrapChordToken(match[0])));
}

/** Transposes one chord, including slash chords and Spanish note names. */
export function transposeChord(chord, semitones, notationMode = 'sharps') {
  const cacheKey = `${chord}_${semitones}_${notationMode}`;
  if (chordCache.has(cacheKey)) return chordCache.get(cacheKey);

  const normalizedChord = normalizeAccidentals(chord);
  const match = normalizedChord.match(new RegExp(`^(${ROOT_PATTERN})(.*)$`));
  if (!match) return chord;

  const [, root, remainder] = match;
  const slashIndex = remainder.lastIndexOf('/');
  const modifier = slashIndex === -1 ? remainder : remainder.slice(0, slashIndex);
  const bass = slashIndex === -1 ? '' : remainder.slice(slashIndex + 1);
  const transposedBass = bass && parseNote(bass) ? transposeNote(bass, semitones, notationMode) : bass;
  const result = `${transposeNote(root, semitones, notationMode)}${modifier}${bass ? `/${transposedBass}` : ''}`;

  chordCache.set(cacheKey, result);
  return result;
}

/** Parses bracketed chords anywhere and bare chords on chord-only lines. */
export function parseChords(text) {
  if (!text) return [];

  const chords = [];
  let lineOffset = 0;
  for (const line of text.split('\n')) {
    const bracketMatches = [...line.matchAll(new RegExp(BRACKETED_CHORD_REGEX.source, 'g'))];
    if (bracketMatches.length > 0) {
      bracketMatches.forEach((match) => chords.push({
        chord: match[1],
        position: lineOffset + match.index,
        fullMatch: match[0],
      }));
    } else if (isChordLine(line)) {
      for (const match of bareChordMatches(line)) {
        const token = unwrapChordToken(match[0]);
        if (token) {
          chords.push({
            chord: token.chord,
            position: lineOffset + match.index + token.prefix.length + (token.wrapper ? 1 : 0),
            fullMatch: token.chord,
          });
        }
      }
    }
    lineOffset += line.length + 1;
  }
  return chords;
}

/** Transposes bracketed chords and complete bare chord lines without touching lyrics. */
export function transposeLine(line, semitones, notationMode = 'sharps') {
  let foundBracketedChord = false;
  const bracketedResult = line.replace(new RegExp(BRACKETED_CHORD_REGEX.source, 'g'), (_match, chord) => {
    foundBracketedChord = true;
    return `[${transposeChord(chord, semitones, notationMode)}]`;
  });

  if (foundBracketedChord || !isChordLine(line)) return bracketedResult;

  return line.replace(/[^\s|,;:]+/g, (rawToken) => {
    const token = unwrapChordToken(rawToken);
    if (!token) return rawToken;
    const chord = transposeChord(token.chord, semitones, notationMode);
    const wrapped = token.wrapper === 'parentheses' ? `(${chord})` : chord;
    return `${token.prefix}${wrapped}${token.suffix}`;
  });
}

export function transposeSong(songText, semitones, notationMode = 'sharps') {
  if (!songText) return '';
  return songText.split('\n').map((line) => transposeLine(line, semitones, notationMode)).join('\n');
}

/** Detects the musical key from the first valid chord and returns standard notation. */
export function detectKey(songText) {
  const firstChord = parseChords(songText)[0]?.chord;
  if (!firstChord) return 'C';
  const root = normalizeAccidentals(firstChord).match(new RegExp(`^(${ROOT_PATTERN})`))?.[1];
  const parsed = root ? parseNote(root) : null;
  if (!parsed) return 'C';
  return root.includes('b') || root.includes('♭') ? FLATS[parsed.index] : SHARPS[parsed.index];
}

export function calculateCapo(_originalKey, transposeValue) {
  return ((transposeValue % 12) + 12) % 12;
}

export function formatChordDisplay(chord, notationMode = 'sharps') {
  return transposeChord(chord, 0, notationMode);
}

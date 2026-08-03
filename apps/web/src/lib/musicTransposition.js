const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const NOTE_TO_INDEX = {};
SHARPS.forEach((note, i) => { NOTE_TO_INDEX[note] = i; });
FLATS.forEach((note, i) => { NOTE_TO_INDEX[note] = i; });

const chordCache = new Map();

/**
 * Normalizes a note to its chromatic index (0-11)
 */
function getNoteIndex(note) {
  return NOTE_TO_INDEX[note] !== undefined ? NOTE_TO_INDEX[note] : -1;
}

/**
 * Transposes a single note by given semitones (internal helper)
 */
function transposeNote(note, semitones, notationMode = 'sharps') {
  const index = getNoteIndex(note);
  if (index === -1) return note;

  const newIndex = (((index + semitones) % 12) + 12) % 12;
  return notationMode === 'flats' ? FLATS[newIndex] : SHARPS[newIndex];
}

/**
 * Transposes a single chord supporting complex formats (e.g., C#m7b5/E)
 */
export function transposeChord(chord, semitones, notationMode = 'sharps') {
  if (semitones === 0 && notationMode === 'sharps') return chord;

  const cacheKey = `${chord}_${semitones}_${notationMode}`;
  if (chordCache.has(cacheKey)) {
    return chordCache.get(cacheKey);
  }

  // Handle slash chords
  if (chord.includes('/')) {
    const [base, bass] = chord.split('/');
    const transposedBase = transposeChord(base, semitones, notationMode);
    const transposedBass = transposeNote(bass, semitones, notationMode);
    const result = `${transposedBase}/${transposedBass}`;
    chordCache.set(cacheKey, result);
    return result;
  }

  // Regex to extract root note and modifiers
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) {
    chordCache.set(cacheKey, chord);
    return chord;
  }

  const root = match[1];
  const modifier = match[2] || '';
  
  const transposedRoot = transposeNote(root, semitones, notationMode);
  const result = `${transposedRoot}${modifier}`;
  
  chordCache.set(cacheKey, result);
  return result;
}

/**
 * Parses all chords from a text string
 */
export function parseChords(text) {
  if (!text) return [];
  const regex = /\[([A-G][#b]?(?:m|maj7|m7|7|add9|sus[24]|6|9|11|13|dim|aug|b5|#5)?(?:\/[A-G][#b]?)?)\]/g;
  const chords = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    chords.push({
      chord: match[1],
      position: match.index,
      fullMatch: match[0]
    });
  }
  
  return chords;
}

/**
 * Transposes all chords in a line of text while preserving format
 */
export function transposeLine(line, semitones, notationMode = 'sharps') {
  if (semitones === 0 && notationMode === 'sharps') return line;
  
  const regex = /\[([A-G][#b]?(?:m|maj7|m7|7|add9|sus[24]|6|9|11|13|dim|aug|b5|#5)?(?:\/[A-G][#b]?)?)\]/g;
  return line.replace(regex, (match, chord) => {
    return `[${transposeChord(chord, semitones, notationMode)}]`;
  });
}

/**
 * Transposes an entire song, preserving structure
 */
export function transposeSong(songText, semitones, notationMode = 'sharps') {
  if (!songText) return '';
  if (semitones === 0 && notationMode === 'sharps') return songText;

  const lines = songText.split('\n');
  return lines.map(line => transposeLine(line, semitones, notationMode)).join('\n');
}

/**
 * Detects the most likely key of a song based on the first chord or highest frequency root note
 */
export function detectKey(songText) {
  if (!songText) return 'C';
  const chords = parseChords(songText);
  if (chords.length === 0) return 'C';
  
  // Basic heuristic: return the root note of the first chord
  const firstChord = chords[0].chord;
  const match = firstChord.match(/^([A-G][#b]?)/);
  return match ? match[1] : 'C';
}

/**
 * Calculates a capo position
 */
export function calculateCapo(originalKey, transposeValue) {
  if (transposeValue === 0) return 0;
  
  let capo = (-transposeValue) % 12;
  if (capo < 0) capo += 12;
  
  return capo;
}

/**
 * Formats a chord display switching between sharps and flats
 */
export function formatChordDisplay(chord, notationMode = 'sharps') {
  return transposeChord(chord, 0, notationMode);
}
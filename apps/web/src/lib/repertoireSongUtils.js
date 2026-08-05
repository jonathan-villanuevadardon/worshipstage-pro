import {
  getSemitoneDifference,
  transposeSong,
} from './musicTransposition.js';

export function getSongChart(song = {}) {
  if (typeof song.chords === 'string' && song.chords.trim()) return song.chords;
  if (typeof song.lyrics === 'string' && song.lyrics.trim()) return song.lyrics;
  return '';
}

export function getRepertoireSongView(repertoireSong = {}) {
  const song = repertoireSong.expand?.song_id || repertoireSong.song || {};
  const originalKey = song.key || '';
  const displayKey = repertoireSong.key_adjustment || originalKey;
  const semitones = originalKey && displayKey
    ? getSemitoneDifference(originalKey, displayKey)
    : 0;
  const notationMode = displayKey.includes('b') ? 'flats' : 'sharps';
  const originalContent = getSongChart(song);

  return {
    song,
    originalKey,
    displayKey,
    semitones,
    originalContent,
    content: transposeSong(originalContent, semitones, notationMode),
  };
}

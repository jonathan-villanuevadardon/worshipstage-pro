import test from 'node:test';
import assert from 'node:assert/strict';
import { getRepertoireSongView, getSongChart } from './repertoireSongUtils.js';

test('uses chords before lyrics when both are available', () => {
  assert.equal(getSongChart({ chords: '[C]Acordes', lyrics: 'Sólo letra' }), '[C]Acordes');
});

test('applies a repertoire key without mutating the original song', () => {
  const song = { key: 'C', chords: '[C]Cristo\n[G]Él me salvó' };
  const repertoireSong = { key_adjustment: 'D', expand: { song_id: song } };
  const view = getRepertoireSongView(repertoireSong);

  assert.equal(view.originalKey, 'C');
  assert.equal(view.displayKey, 'D');
  assert.equal(view.semitones, 2);
  assert.equal(view.content, '[D]Cristo\n[A]Él me salvó');
  assert.equal(song.chords, '[C]Cristo\n[G]Él me salvó');
});

test('keeps the original chart when the repertoire has no adjustment', () => {
  const repertoireSong = {
    key_adjustment: '',
    expand: { song_id: { key: 'G', chords: '[G]Original' } },
  };
  assert.equal(getRepertoireSongView(repertoireSong).content, '[G]Original');
});

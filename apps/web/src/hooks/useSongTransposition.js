import { useState, useCallback, useMemo } from 'react';
import {
  clampSemitones,
  detectKey,
  findSimplestCapo,
  getSemitoneDifference,
  getVisualTransposition,
  keyToIndex,
  normalizeCapo,
  transposeKey,
  transposeSong,
} from '@/lib/musicTransposition';

export function useSongTransposition(initialSongText = '', initialKey = '') {
  const originalKey = useMemo(
    () => (keyToIndex(initialKey) !== -1 ? initialKey : detectKey(initialSongText)),
    [initialKey, initialSongText]
  );

  const [transposeValue, setTransposeValue] = useState(0);
  const [notationMode, setNotationMode] = useState(() => (originalKey.includes('b') ? 'flats' : 'sharps'));
  const [capo, setCapo] = useState(0);

  const realKey = useMemo(
    () => transposeKey(originalKey, transposeValue, notationMode),
    [originalKey, transposeValue, notationMode]
  );
  const visualTransposeValue = useMemo(
    () => getVisualTransposition(transposeValue, capo),
    [transposeValue, capo]
  );
  const visualKey = useMemo(
    () => transposeKey(originalKey, visualTransposeValue, notationMode),
    [originalKey, visualTransposeValue, notationMode]
  );
  const recommendedCapo = useMemo(
    () => findSimplestCapo(initialSongText, transposeValue, notationMode),
    [initialSongText, transposeValue, notationMode]
  );

  const updateTransposeValue = useCallback((value) => {
    setTransposeValue(clampSemitones(value));
  }, []);

  const updateCapo = useCallback((value) => {
    setCapo(normalizeCapo(value));
  }, []);

  const updateNotationMode = useCallback((mode) => {
    if (mode === 'sharps' || mode === 'flats') setNotationMode(mode);
  }, []);

  const updateDestinationKey = useCallback((newKey) => {
    setTransposeValue(getSemitoneDifference(originalKey, newKey));
    if (newKey.includes('b')) setNotationMode('flats');
    if (newKey.includes('#')) setNotationMode('sharps');
  }, [originalKey]);

  const simplifyChords = useCallback(() => {
    setCapo(recommendedCapo);
  }, [recommendedCapo]);

  const resetTransposition = useCallback(() => {
    setTransposeValue(0);
    setCapo(0);
  }, []);

  const getTransposedSong = useCallback((songText) => {
    return transposeSong(songText, visualTransposeValue, notationMode);
  }, [visualTransposeValue, notationMode]);

  return {
    originalKey,
    transposeValue,
    visualTransposeValue,
    capo,
    notationMode,
    destinationKey: realKey,
    realKey,
    visualKey,
    recommendedCapo,
    chordsAreSimplified: capo === recommendedCapo,
    updateTransposeValue,
    updateCapo,
    updateNotationMode,
    updateDestinationKey,
    simplifyChords,
    resetTransposition,
    getTransposedSong,
  };
}

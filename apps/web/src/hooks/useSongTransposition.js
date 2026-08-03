import { useState, useCallback, useMemo } from 'react';
import { transposeSong, calculateCapo, detectKey } from '@/lib/musicTransposition';

export function useSongTransposition(initialSongText = '', initialKey = '') {
  const defaultKey = useMemo(() => initialKey || detectKey(initialSongText), [initialKey, initialSongText]);

  const [transposeValue, setTransposeValue] = useState(0);
  const [notationMode, setNotationMode] = useState('sharps');
  const [destinationKey, setDestinationKey] = useState(defaultKey);

  const capo = useMemo(() => calculateCapo(defaultKey, transposeValue), [defaultKey, transposeValue]);

  const updateTransposeValue = useCallback((value) => {
    setTransposeValue(value);
    // Note: destinationKey logic would typically be updated here to match the new interval, 
    // but for simplicity, we focus on the raw semitone value.
  }, []);

  const updateCapo = useCallback((value) => {
    // If user sets capo manually, we adjust transposeValue inversely
    setTransposeValue(-value);
  }, []);

  const updateNotationMode = useCallback((mode) => {
    setNotationMode(mode);
  }, []);

  const updateDestinationKey = useCallback((newKey, originalKey) => {
    const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
    let origIndex = SHARPS.indexOf(originalKey);
    if (origIndex === -1) origIndex = FLATS.indexOf(originalKey);
    
    let destIndex = SHARPS.indexOf(newKey);
    if (destIndex === -1) destIndex = FLATS.indexOf(newKey);
    
    if (origIndex !== -1 && destIndex !== -1) {
      let diff = destIndex - origIndex;
      if (diff > 6) diff -= 12;
      if (diff < -5) diff += 12;
      setTransposeValue(diff);
      setDestinationKey(newKey);
    }
  }, []);

  const resetTransposition = useCallback(() => {
    setTransposeValue(0);
    setDestinationKey(defaultKey);
  }, [defaultKey]);

  const getTransposedSong = useCallback((songText) => {
    return transposeSong(songText, transposeValue, notationMode);
  }, [transposeValue, notationMode]);

  return {
    transposeValue,
    capo,
    notationMode,
    destinationKey,
    updateTransposeValue,
    updateCapo,
    updateNotationMode,
    updateDestinationKey,
    resetTransposition,
    getTransposedSong
  };
}
// src/hooks/useSlides.js
import { useState, useEffect } from 'react';
import { initGameBus, listenToSlides, getGameData } from '../state/GameBus';

export function useSlides() {
  const [slides, setSlides] = useState(getGameData().slides);

  useEffect(() => {
    initGameBus();
    const unsub = listenToSlides((slice) => {
      console.log('[useSlides] got slide slice', slice);
      setSlides(slice);
    });

    return () => unsub();
  }, []);

  return { buffer: slides.buffer, active: slides.active };
}

// src/hooks/useSlides.js
import { useState, useEffect } from 'react';
import { initGameBus, listenToSlice, getGameData } from '../state/GameBus';

export function useSlides() {
  const [slides, setSlides] = useState(getGameData().slides);

  useEffect(() => {
    initGameBus();

    const unsub = listenToSlice('SLIDES_UPDATE', (slice) => {
      setSlides(slice);
    });

    return () => unsub();
  }, []);

  const buffer = slides.buffer ?? [];
  const activeIndex = slides.active ?? 0;

  return { buffer, active: activeIndex };
}

import { useState, useEffect } from 'react';
import { initGameBus, listenToSlides, getGameData } from '../state/GameBus';

export function useSlides() {
  const [slides, setSlides] = useState(getGameData().slides);

  useEffect(() => {
    initGameBus();
    const unsub = listenToSlides((slice) => {
      setSlides(slice);
    });

    return () => unsub();
  }, []);

  const buffer = slides.buffer ?? [];
  const activeIndex = slides.active ?? 0; // already an index

  return { buffer, active: activeIndex };
}

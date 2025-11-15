// src/hooks/usePageTitle.js
import { useEffect } from 'react';

/**
 * Sets the browser tab title
 * @param {string} title - The page title
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}

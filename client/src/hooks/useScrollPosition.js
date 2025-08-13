// hooks/useScrollPosition.js
import { useEffect, useRef } from 'react';

export const useScrollPosition = (key) => {
  const scrollPositionRef = useRef(0);

  const saveScrollPosition = () => {
    scrollPositionRef.current = window.scrollY;
    if (key) {
      sessionStorage.setItem(`scroll_${key}`, scrollPositionRef.current.toString());
    }
  };

  const restoreScrollPosition = () => {
    const getPosition = () => {
      if (key) {
        const saved = sessionStorage.getItem(`scroll_${key}`);
        if (saved) return parseInt(saved, 10);
      }
      return scrollPositionRef.current;
    };

    const position = getPosition();
    if (position > 0) {
      // Use requestAnimationFrame for smoother restoration
      requestAnimationFrame(() => {
        window.scrollTo({
          top: position,
          behavior: 'instant' // Changed to 'instant' for immediate scroll
        });
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { saveScrollPosition, restoreScrollPosition };
};
import { useEffect, useRef } from 'react';

export const useScrollPosition = (key) => {
  const scrollPositionRef = useRef(0);

  const saveScrollPosition = () => {
    scrollPositionRef.current = window.pageYOffset;
    if (key) {
      sessionStorage.setItem(`scroll_${key}`, scrollPositionRef.current.toString());
    }
  };

  const restoreScrollPosition = () => {
    if (key) {
      const saved = sessionStorage.getItem(`scroll_${key}`);
      if (saved) {
        const position = parseInt(saved, 10);
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          window.scrollTo(0, position);
        }, 100);
        return;
      }
    }
    
    if (scrollPositionRef.current > 0) {
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 100);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.pageYOffset;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { saveScrollPosition, restoreScrollPosition };
};

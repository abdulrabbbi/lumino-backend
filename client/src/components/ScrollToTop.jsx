// components/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, state } = useLocation();

  useEffect(() => {
    // Only scroll to top if not coming from an activity
    if (!state?.fromActivity) {
      window.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
  }, [pathname, state]);

  return null;
};

export default ScrollToTop;
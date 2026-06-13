import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions: Record<string, number> = {};

export default function ScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    // Save scroll position when leaving/scrolling the page
    const handleScroll = () => {
      const key = location.pathname + location.search;
      scrollPositions[key] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, location.search]);

  useEffect(() => {
    // Restore scroll position when entering page
    const key = location.pathname + location.search;
    const saved = scrollPositions[key];
    if (saved !== undefined) {
      // Use setTimeout to allow the DOM content to render before scrolling
      setTimeout(() => window.scrollTo(0, saved), 50);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search]);

  return null;
}

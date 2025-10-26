// hooks/useMediaQuery.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using media queries
 * @param query The media query to check against (e.g. '(max-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to false to avoid hydration mismatch
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Create media query list
    const media = window.matchMedia(query);
    
    // Set initial state
    setMatches(media.matches);
    
    // Define listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    
    // Add listener
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);
  
  return matches;
}
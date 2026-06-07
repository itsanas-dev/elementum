import { useEffect, useState } from "react";

export default function useMediaQuery(mediaQuery: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(mediaQuery).matches);

  useEffect(() => {
    const list = window.matchMedia(mediaQuery);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);

    list.addEventListener("change", onChange);
    
    return () => list.removeEventListener("change", onChange);
  }, [mediaQuery])

  return matches
}
import { useEffect, useRef, useState } from 'react';

interface Options { threshold?: number; rootMargin?: string; enabled?: boolean; }

export function useIntersectionObserver(options: Options = {}) {
  const { threshold = 0.1, rootMargin = '0px', enabled = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin, enabled]);

  return { ref, isIntersecting };
}

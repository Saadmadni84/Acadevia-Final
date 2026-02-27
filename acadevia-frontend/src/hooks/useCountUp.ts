import { useState, useEffect, useRef } from 'react';

export function useCountUp(end: number, duration: number = 1000, start: number = 0) {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const diff = end - start;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, start]);

  return count;
}

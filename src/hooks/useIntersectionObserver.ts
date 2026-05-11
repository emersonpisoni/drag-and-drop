import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver<T extends Element>(
  options?: IntersectionObserverInit,
  onChange?: (entry: IntersectionObserverEntry) => void,
) {
  const ref = useRef<T | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([first]) => {
      setEntry(first);
      onChangeRef.current?.(first);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, entry, isVisible: entry?.isIntersecting ?? false };
}

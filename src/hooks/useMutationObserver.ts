import { useEffect, useRef } from 'react';

export function useMutationObserver(
  target: Element | null,
  callback: MutationCallback,
  options: MutationObserverInit = { childList: true, subtree: true },
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!target) return;
    const observer = new MutationObserver((records, obs) => {
      callbackRef.current(records, obs);
    });
    observer.observe(target, options);
    return () => observer.disconnect();
  }, [target, options]);
}

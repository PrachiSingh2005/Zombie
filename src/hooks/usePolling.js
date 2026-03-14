import { useEffect, useRef, useCallback } from 'react';

/**
 * usePolling — calls `fetchFn` immediately and then every `interval` ms.
 * Cleans up the interval when the component unmounts or params change.
 *
 * @param {() => Promise<void>} fetchFn  — async function that loads data
 * @param {number} interval              — polling interval in ms (default 15 000)
 */
const usePolling = (fetchFn, interval = 15000) => {
  const savedFn = useRef(fetchFn);

  // Keep the ref up-to-date if the caller's fetchFn identity changes
  useEffect(() => {
    savedFn.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    // Fire immediately on mount
    savedFn.current();
    const id = setInterval(() => savedFn.current(), interval);
    return () => clearInterval(id);
  }, [interval]);
};

export default usePolling;

import { useState, useEffect } from "react";

// Module-level cache — survives component remounts. Cleared on full page reload.
const cacheStore = new Map();
const DEFAULT_TTL_MS = 60 * 1000;
const MAX_CACHE_ENTRIES = 50;

function setCacheEntry(key, value) {
  if (cacheStore.size >= MAX_CACHE_ENTRIES && !cacheStore.has(key)) {
    const oldestKey = cacheStore.keys().next().value;
    cacheStore.delete(oldestKey);
  }
  cacheStore.set(key, value);
}

export function useFetch(url, options = {}) {
  const { errorMessage = "Request failed", ttl = DEFAULT_TTL_MS } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(url));

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    const cached = cacheStore.get(url);
    const isFresh = cached && Date.now() - cached.timestamp < ttl;

    if (isFresh) {
      setData(cached.data);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(errorMessage);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setCacheEntry(url, { data: json, timestamp: Date.now() });
          setData(json);
        }
      })
      .catch((err) => {
        if (!cancelled && err.name !== "AbortError") {
          console.error(err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, errorMessage, ttl]);

  return { data, error, loading };
}

export default useFetch;
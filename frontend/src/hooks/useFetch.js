import { useState, useEffect } from "react";

// Module-level cache — lives outside the hook so it survives component
// remounts. Cleared on full page reload.
const cacheStore = new Map();
const DEFAULT_TTL_MS = 60 * 1000; // 60s — matches server cache staleness window

export function useFetch(url, options = {}) {
  const { errorMessage = "Request failed", ttl = DEFAULT_TTL_MS } = options;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {

      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(errorMessage);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          cacheStore.set(url, { data: json, timestamp: Date.now() });
          setData(json);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, errorMessage, ttl]);

  return { data, error, loading };
}

export default useFetch;
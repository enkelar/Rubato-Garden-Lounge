import { useEffect, useState } from "react";

const cacheStore = new Map();
const requestStore = new Map();

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

function setCacheEntry(key, value) {
  if (cacheStore.size >= MAX_CACHE_ENTRIES && !cacheStore.has(key)) {
    const oldestKey = cacheStore.keys().next().value;
    cacheStore.delete(oldestKey);
  }

  cacheStore.set(key, value);
}

function getFreshCache(url, ttl) {
  const cached = cacheStore.get(url);

  if (!cached) return null;

  if (Date.now() - cached.timestamp >= ttl) {
    cacheStore.delete(url);
    return null;
  }

  return cached.data;
}

export function prefetch(url, options = {}) {
  if (!url || cacheStore.has(url) || requestStore.has(url)) {
    return requestStore.get(url);
  }

  const {
    ttl = DEFAULT_TTL_MS,
    errorMessage = "Request failed",
  } = options;

  const controller = new AbortController();

  const request = fetch(url, {
    signal: controller.signal,
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(errorMessage);
      }

      return response.json();
    })
    .then((json) => {
      setCacheEntry(url, {
        data: json,
        timestamp: Date.now(),
        ttl,
      });

      return json;
    })
    .finally(() => {
      requestStore.delete(url);
    });

  requestStore.set(url, request);

  return request;
}

export function clearFetchCache(prefix = "") {
  for (const key of cacheStore.keys()) {
    if (!prefix || key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

export function useFetch(url, options = {}) {
  const {
    errorMessage = "Request failed",
    ttl = DEFAULT_TTL_MS,
  } = options;

  const [data, setData] = useState(() => getFreshCache(url, ttl));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(
    Boolean(url && !getFreshCache(url, ttl))
  );

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const cachedData = getFreshCache(url, ttl);

    if (cachedData) {
      setData(cachedData);
      setError(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    prefetch(url, { ttl, errorMessage })
      .then((json) => {
        if (!cancelled) {
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
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, ttl, errorMessage]);

  return {
    data,
    error,
    loading,
  };
}

export default useFetch;
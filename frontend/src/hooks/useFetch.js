import { useEffect, useState } from "react";

const cacheStore = new Map();
const requestStore = new Map();
const STORAGE_PREFIX = "rg_cache:";

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

function readStored(url) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + url);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(url, data) {
  try {
    localStorage.setItem(STORAGE_PREFIX + url, JSON.stringify(data));
  } catch {
    /* quota or private mode, ignore */
  }
}

function takeEarly(url) {
  const early = typeof window !== "undefined" && window.__RG_EARLY__;
  if (early && early.url === url) {
    window.__RG_EARLY__ = null;
    return early.promise;
  }
  return null;
}

function setCacheEntry(key, value) {
  if (cacheStore.size >= MAX_CACHE_ENTRIES && !cacheStore.has(key)) {
    cacheStore.delete(cacheStore.keys().next().value);
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

  const { ttl = DEFAULT_TTL_MS, errorMessage = "Request failed", persist = false } = options;

  const network = () =>
    fetch(url, { headers: { Accept: "application/json" } }).then((response) => {
      if (!response.ok) throw new Error(errorMessage);
      return response.json();
    });

  const request = (takeEarly(url) || network())
    .then((json) => {
      setCacheEntry(url, { data: json, timestamp: Date.now(), ttl });
      if (persist) writeStored(url, json);
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
    if (!prefix || key.startsWith(prefix)) cacheStore.delete(key);
  }
}

export function useFetch(url, options = {}) {
  const { errorMessage = "Request failed", ttl = DEFAULT_TTL_MS, persist = false } = options;

  const [data, setData] = useState(
    () => getFreshCache(url, ttl) ?? (persist && url ? readStored(url) : null)
  );
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(url) && data === null);

  useEffect(() => {
    if (!url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData(null);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const fresh = getFreshCache(url, ttl);
    if (fresh) {
      setData(fresh);
      setError(null);
      setLoading(false);
      return undefined;
    }

    // show last-known data immediately (if any), then revalidate in the background
    const stale = persist ? readStored(url) : null;
    if (stale) {
      setData(stale);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    let cancelled = false;

    prefetch(url, { ttl, errorMessage, persist })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled && err.name !== "AbortError") {
          console.error(err);
          if (!stale) setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, ttl, errorMessage, persist]);

  return { data, error, loading };
}

export default useFetch;
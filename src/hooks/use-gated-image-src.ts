"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

export type GatedImageStatus = "loading" | "ready" | "error";

type UseGatedImageSrcOptions = {
  enabled?: boolean;
};

/** Preload gate — image is shown only after the browser has fully fetched/decoded `src`. */
export function useGatedImageSrc(
  src: string | undefined,
  { enabled = true }: UseGatedImageSrcOptions = {},
): { displaySrc: string | null; status: GatedImageStatus } {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [status, setStatus] = useState<GatedImageStatus>("loading");

  useEffect(() => {
    if (!enabled || !src) {
      setDisplaySrc(null);
      setStatus(src ? "loading" : "loading");
      return;
    }

    let cancelled = false;
    setDisplaySrc(null);
    setStatus("loading");

    const img = new window.Image();
    img.decoding = "async";

    const commit = () => {
      if (!cancelled) {
        setDisplaySrc(src);
        setStatus("ready");
      }
    };

    const fail = () => {
      if (!cancelled) {
        setDisplaySrc(null);
        setStatus("error");
      }
    };

    img.onload = commit;
    img.onerror = fail;
    img.src = src;

    if (img.complete && img.naturalWidth > 0) {
      commit();
    }

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, enabled]);

  return { displaySrc, status };
}

/** Marks ready when the rendered `<img>` is complete (covers cache + Next/Image). */
export function useImageLoaded(src: string | undefined): {
  imgRef: RefObject<HTMLImageElement | null>;
  isLoaded: boolean;
  hasError: boolean;
  markLoaded: () => void;
  markError: () => void;
} {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useLayoutEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [src]);

  return {
    imgRef,
    isLoaded,
    hasError,
    markLoaded: () => setIsLoaded(true),
    markError: () => setHasError(true),
  };
}

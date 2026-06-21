"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

export type GatedImageStatus = "loading" | "ready" | "error";

type UseGatedImageSrcOptions = {
  enabled?: boolean;
  /** Keep the previous image visible while the next src loads (smooth color swaps). */
  keepPreviousWhileLoading?: boolean;
};

function isImageCached(src: string): boolean {
  const probe = new window.Image();
  probe.src = src;
  return probe.complete && probe.naturalWidth > 0;
}

function getCachedImageState(
  src: string | undefined,
  enabled: boolean,
): { displaySrc: string | null; status: GatedImageStatus } {
  if (!enabled || !src) {
    return { displaySrc: null, status: "loading" };
  }

  if (typeof window !== "undefined" && isImageCached(src)) {
    return { displaySrc: src, status: "ready" };
  }

  return { displaySrc: null, status: "loading" };
}

/** Preload gate — image is shown only after the browser has fully fetched/decoded `src`. */
export function useGatedImageSrc(
  src: string | undefined,
  { enabled = true, keepPreviousWhileLoading = false }: UseGatedImageSrcOptions = {},
): { displaySrc: string | null; status: GatedImageStatus } {
  const [displaySrc, setDisplaySrc] = useState<string | null>(
    () => getCachedImageState(src, enabled).displaySrc,
  );
  const [status, setStatus] = useState<GatedImageStatus>(
    () => getCachedImageState(src, enabled).status,
  );

  useEffect(() => {
    if (!enabled || !src) {
      setDisplaySrc(null);
      setStatus("loading");
      return;
    }

    let cancelled = false;

    const commit = () => {
      if (!cancelled) {
        setDisplaySrc(src);
        setStatus("ready");
      }
    };

    const fail = () => {
      if (!cancelled) {
        if (!keepPreviousWhileLoading) {
          setDisplaySrc(null);
        }
        setStatus("error");
      }
    };

    if (isImageCached(src)) {
      commit();
      return () => {
        cancelled = true;
      };
    }

    if (!keepPreviousWhileLoading) {
      setDisplaySrc(null);
    }

    setStatus("loading");

    const img = new window.Image();
    img.decoding = "async";

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
  }, [src, enabled, keepPreviousWhileLoading]);

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
  const [isLoaded, setIsLoaded] = useState(
    () => Boolean(src && typeof window !== "undefined" && isImageCached(src)),
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src && isImageCached(src)) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

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

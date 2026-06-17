const preloaded = new Set<string>();

/** Warm the browser image cache for instant preview open. */
export function preloadImage(src: string | undefined | null): void {
  if (!src || preloaded.has(src)) {
    return;
  }

  preloaded.add(src);
  const img = new window.Image();
  img.decoding = "async";
  img.src = src;
}

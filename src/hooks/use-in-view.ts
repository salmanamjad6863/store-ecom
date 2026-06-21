"use client";

import { useEffect, useLayoutEffect, useState, type RefObject } from "react";

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number;
  /** Skip observation — treat as always in view (e.g. first-row cards). */
  immediate?: boolean;
};

export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = "280px 0px", threshold = 0, immediate = false }: UseInViewOptions = {},
): boolean {
  const [inView, setInView] = useState(immediate);

  useLayoutEffect(() => {
    if (immediate) {
      setInView(true);
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const marginMatch = /^(-?\d+(?:\.\d+)?)px/.exec(rootMargin);
    const marginPx = marginMatch ? Number(marginMatch[1]) : 280;
    const rect = element.getBoundingClientRect();
    const verticallyVisible =
      rect.top < window.innerHeight + marginPx && rect.bottom > -marginPx;

    if (verticallyVisible) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, rootMargin, threshold, immediate]);

  return inView;
}

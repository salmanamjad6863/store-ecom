"use client";

import { useEffect, useState, type RefObject } from "react";

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

  useEffect(() => {
    if (immediate) {
      setInView(true);
      return;
    }

    const element = ref.current;
    if (!element) {
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

"use client";

import { HydrationBoundary, type DehydratedState } from "@tanstack/react-query";
import type { ReactNode } from "react";

type CatalogHydrationProps = {
  state: DehydratedState;
  children: ReactNode;
};

export function CatalogHydration({ state, children }: CatalogHydrationProps) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}

"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ModelFilterDrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

const ModelFilterDrawerContext = createContext<ModelFilterDrawerContextValue | null>(null);

export function ModelFilterDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((current) => !current), []);

  const value = useMemo(
    () => ({ isOpen, openDrawer, closeDrawer, toggleDrawer }),
    [isOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  return (
    <ModelFilterDrawerContext.Provider value={value}>{children}</ModelFilterDrawerContext.Provider>
  );
}

export function useModelFilterDrawer() {
  const context = useContext(ModelFilterDrawerContext);

  if (!context) {
    throw new Error("useModelFilterDrawer must be used within ModelFilterDrawerProvider");
  }

  return context;
}

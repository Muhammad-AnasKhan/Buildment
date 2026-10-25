"use client";

// The learner's choice of names (generic or AWS), shared by every part of the
// board, and remembered between visits.

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { ComponentKind } from "./catalog";
import { currentNameMode, localize, partName, sizeLabel, subscribeNameMode, writeNameMode, type NameMode } from "./aws-names";

export interface Names {
  mode: NameMode;
  setMode: (m: NameMode) => void;
  /** A part's name in the chosen mode. */
  nameOf: (kind: ComponentKind) => string;
  /** A size's label in the chosen mode. */
  sizeText: (kind: ComponentKind, sizeId: string) => string;
  /** A sentence with the chosen names in it. */
  text: (sentence: string) => string;
}

const GENERIC: Names = {
  mode: "generic",
  setMode: () => undefined,
  nameOf: (k) => partName(k, "generic"),
  sizeText: (k, s) => sizeLabel(k, s, "generic").label,
  text: (s) => s,
};

const NamesContext = createContext<Names>(GENERIC);
export const useNames = () => useContext(NamesContext);

/** Reads and writes the remembered mode. Server and first client render are generic, so hydration matches. */
export function NamesProvider({ children }: { children: ReactNode }) {
  const mode = useSyncExternalStore(subscribeNameMode, currentNameMode, () => "generic" as NameMode);
  const setMode = useCallback((m: NameMode) => writeNameMode(m), []);
  const value = useMemo<Names>(
    () => ({
      mode,
      setMode,
      nameOf: (k) => partName(k, mode),
      sizeText: (k, s) => sizeLabel(k, s, mode).label,
      text: (s) => localize(s, mode),
    }),
    [mode, setMode],
  );
  return <NamesContext.Provider value={value}>{children}</NamesContext.Provider>;
}

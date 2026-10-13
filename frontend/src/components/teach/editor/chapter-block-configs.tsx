"use client";

import { createContext, useContext, type ReactNode } from "react";

const ChapterBlockConfigsContext = createContext<Record<string, unknown>>({});

export function ChapterBlockConfigsProvider({
  configs,
  children,
}: {
  configs: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <ChapterBlockConfigsContext.Provider value={configs}>
      {children}
    </ChapterBlockConfigsContext.Provider>
  );
}

export function useChapterBlockConfig(blockId: string | undefined): unknown {
  const configs = useContext(ChapterBlockConfigsContext);
  if (!blockId) return undefined;
  return configs[blockId];
}

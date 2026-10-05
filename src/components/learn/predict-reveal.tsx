"use client";

import { createContext, useContext } from "react";

const PredictRevealContext = createContext({ gate: false, revealed: true });

export function PredictRevealProvider({
  gate,
  revealed,
  children,
}: {
  gate: boolean;
  revealed: boolean;
  children: React.ReactNode;
}) {
  return <PredictRevealContext.Provider value={{ gate, revealed }}>{children}</PredictRevealContext.Provider>;
}

export function usePredictReveal() {
  return useContext(PredictRevealContext);
}

export function PredictRevealHold() {
  return (
    <p className="p-4 text-sm leading-relaxed text-muted-foreground">
      Answer the prediction in this lesson to reveal this.
    </p>
  );
}

"use client";

import { DesignStepper } from "../primitives/design-stepper";
import { pasteBoxDesign } from "./pastebox";

/** Closing beat of 1.4: step PasteBox through the six steps of the design loop. */
export function DesignLoopCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  return <DesignStepper design={pasteBoxDesign} title={title} limits={limits} />;
}

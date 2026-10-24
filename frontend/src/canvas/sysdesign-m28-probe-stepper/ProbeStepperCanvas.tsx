"use client";

import { useMemo } from "react";
import { probeDesign } from "../models/probe-design";
import { DesignStepper } from "../primitives/design-stepper";

// The cards sit close together, so a request's label goes above or below the row of cards.
const LABEL_ROWS = [-31, 11, -52, 31];

/** 28.3 beat 2: one design answers six follow-up questions. */
export function ProbeStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const design = useMemo(() => probeDesign(), []);
  return <DesignStepper design={design} title={title} limits={limits} labelRows={LABEL_ROWS} />;
}

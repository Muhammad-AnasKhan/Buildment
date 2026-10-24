"use client";

import { useMemo } from "react";
import { interviewDesign } from "../models/interview-plan";
import { DesignStepper } from "../primitives/design-stepper";

// The cards sit close together, so a request's label goes above or below the row of cards.
const LABEL_ROWS = [-31, 11, -52, 31];

/** 28.2 beat 1: step a 45-minute round, six boxes of time. */
export function InterviewStepperCanvas({ title, limits }: { title: string; purpose: string; limits: string }) {
  const design = useMemo(() => interviewDesign(), []);
  return <DesignStepper design={design} title={title} limits={limits} labelRows={LABEL_ROWS} />;
}

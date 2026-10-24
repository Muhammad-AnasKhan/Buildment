import { createElement } from "react";
import type { CustomCanvasSpec } from "../registry";
import { EstimatorCanvas, type EstimatorSetup } from "./EstimatorCanvas";

// 2.3 "Back-of-the-envelope estimation": Sada, the chapter's fictional
// voice-notes app. Starting values are the chapter's assumptions: 1,000,000
// daily users, 20 requests each, peak factor 3, 1 in 10 users records a
// 200 KB note, 10 plays each, 3 copies. Plain data only: this file has no
// "use client", and the wrapper below only renders the client component.
export const SADA_ESTIMATE: EstimatorSetup = {
  steps: {
    users: [10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000, 1_000_000_000],
    requestsPerUser: [1, 2, 5, 10, 20, 50, 100, 200],
    peakFactor: [1, 1.5, 2, 3, 4, 5, 6, 8, 10],
    itemBytes: [10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000],
  },
  start: { users: 1_000_000, requestsPerUser: 20, peakFactor: 3, itemBytes: 200_000, writeShare: 0.1, readsPerUser: 10, copies: 3 },
  // Rules of thumb for this picture, not limits of any real machine.
  limits: { serverPerSecond: 1_000, diskBytes: 20e12, linkBitsPerSecond: 10e9 },
  names: { users: "Daily users", requestsPerUser: "Requests per user", peakFactor: "Peak factor", itemBytes: "Note size" },
  years: 5,
};

const TITLE = "Sada's estimate, step by step";
const PURPOSE = "Change daily users, requests, the peak factor or the note size and watch every step of the working update, down to the number that drives the design.";
const LIMITS =
  "Every input is an assumption for a fictional app, and 1 KB is 1,000 bytes. The picture calls one server enough up to about 1,000 requests a second, one disk enough up to about 20 TB, and one network link enough up to 10 Gbit/s: rough rules of thumb, not limits of real machines. It leaves out metadata, indexes, backups, growth and headroom.";

function EstimatorBeat(props: { title: string; purpose: string; limits: string }) {
  return createElement(EstimatorCanvas, { ...props, setup: SADA_ESTIMATE });
}

export const sysdesignM2Estimator: CustomCanvasSpec = {
  kind: "custom",
  title: TITLE,
  purpose: PURPOSE,
  limits: LIMITS,
  component: EstimatorBeat,
};

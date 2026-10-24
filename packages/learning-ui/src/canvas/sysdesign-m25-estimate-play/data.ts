import type { CustomCanvasSpec } from "../registry";
import { EstimatePlayCanvas } from "./EstimatePlayCanvas";

// 25.1 beat 2: Tazkara's ticket drop drawn as three chains from two cards.
// Model: models/ticket-drop.ts. Built on primitives/estimate-chain.tsx.
export const sysdesignM25EstimatePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the crowd, find the pain",
  purpose: "Change the fans waiting or the seats and watch three chains update: requests a second, fans per seat with the share of holds that must fail, and payments a second with the money moved.",
  limits:
    "Tazkara is made up and every number is a course assumption: half of the fans arrive in the first 10 seconds, each fan makes 4 requests and tries 1 hold, a buyer takes 2 minutes to pay, and a ticket costs 80. The picture counts every hold attempt as a fresh fan, so it ignores retries, bots and fans who give up. The 50% mark that rings the failed share is a rule of thumb for this picture, not a limit of any real system.",
  component: EstimatePlayCanvas,
};

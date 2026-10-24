import type { CustomCanvasSpec } from "../registry";
import { KneePlayCanvas } from "./KneePlayCanvas";

// 2.5: requests a second against a server that can finish 100 a second
// (10 ms each). M/M/1: W = 1 / (100 - lambda), L = rho / (1 - rho), and
// Little's law L = lambda x W ties them together. Model: models/server-load.ts.
export const sysdesignM2KneePlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the load to the knee",
  purpose: "Drag requests a second toward the server's limit of 100 and watch the line, the wait and Little's law move together, bending up sharply near the top.",
  limits:
    "The M/M/1 queue model: random arrivals, random service times, one server that needs 10 ms per request. Real systems do not match it exactly, so read it for the shape (the knee), not for exact numbers. One dot stands for one request inside, up to 12; past that the line is cut short. Past 100 a second the model has no steady state, so the picture shows the line growing instead.",
  component: KneePlayCanvas,
};

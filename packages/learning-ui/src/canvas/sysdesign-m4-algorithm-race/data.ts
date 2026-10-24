import type { CustomCanvasSpec } from "../registry";
import { AlgorithmRaceCanvas } from "./AlgorithmRaceCanvas";

// 4.5 "Same traffic, four algorithms": one seeded stream of requests through
// random, round robin, least connections and two choices, each in front of 4
// servers that finish 100 a second at 10 ms average work, with 1 request in 20
// costing 20 times more. Model: models/balancer-race.ts, on the sim core.
export const sysdesignM4AlgorithmRace: CustomCanvasSpec = {
  kind: "custom",
  title: "Same traffic, four algorithms",
  purpose: "Drag the load and watch the same requests go through four balancers: each server's line and each balancer's p99.",
  limits:
    "A simulated run of 6,000 requests with one fixed random seed, so the numbers are exact for this run but would vary a little with another seed. Work is two-valued: 19 requests in 20 take about 5 ms and 1 in 20 takes about 100 ms (a mean of 10 ms). Each server serves one request at a time, in order. The balancer sees exact counts of requests in flight, which a fleet with several balancers would not. Because the slow requests set a floor of about 100 ms on p99, all four start there. The queue pictures replay a short stretch of the run, one dot per request, a long bar for a slow one.",
  component: AlgorithmRaceCanvas,
};

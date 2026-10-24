import type { CustomCanvasSpec } from "../registry";
import { GatewayJobsCanvas } from "./GatewayJobsCanvas";

// 6.6 beat 4: six gateway jobs (TLS, token check, rate limit, request id,
// order rules, routing), each on or off. Three callers send requests: Huda,
// a scraper and a stranger. Model: models/gateway-jobs.ts.
export const sysdesignM6GatewayJobs: CustomCanvasSpec = {
  kind: "custom",
  title: "Switch gateway jobs on and off",
  purpose: "Turn the gateway's jobs on and off and follow three callers through: a missing check lets the wrong request in, and order rules pull order data into the gateway.",
  limits:
    "One gateway copy is drawn; real gateways run several behind a load balancer. The 50 microsecond hop is napkin-math's figure for a proxy, so no time is shown per job. With routing off the callers go straight to each service, so none of the gateway's checks stand in their way.",
  component: GatewayJobsCanvas,
};

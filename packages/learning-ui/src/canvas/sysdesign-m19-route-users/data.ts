import type { CustomCanvasSpec } from "../registry";
import { RouteUsersCanvas } from "./RouteUsersCanvas";

// 19.5 beat 2, "Route users, then fail a region". Model: ./model.ts.
export const sysdesignM19RouteUsers: CustomCanvasSpec = {
  kind: "custom",
  title: "Route users, then fail a region",
  purpose: "Pick a routing policy, then tap a region to fail it. With DNS policies the users on the failed region are dark for the health check time plus the DNS cache time; anycast has no cache to wait for. The survivor receives the failed region's users.",
  limits: "Two regions, three user groups, a course health check of 30 s x 3, and a TTL you can switch. DNS routing also depends on where the resolver is, not the phone (chapter 3.3).",
  component: RouteUsersCanvas,
};

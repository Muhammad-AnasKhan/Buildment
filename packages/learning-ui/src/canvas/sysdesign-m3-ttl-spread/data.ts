import type { CustomCanvasSpec } from "../registry";
import { TtlSpreadCanvas } from "./TtlSpreadCanvas";

// 3.3, beat 3: 20 resolvers cached the old address at different moments
// before the change. Resolver i holds a copy aged (i + 0.5) / 20 x TTL and
// switches when it expires, so the share on the new address is
// min(1, t / TTL). Model: models/ttl-spread.ts.
export const sysdesignM3TtlSpread: CustomCanvasSpec = {
  kind: "custom",
  title: "Pick a TTL, drag time forward",
  purpose: "Choose a TTL and drag time after a DNS change: each resolver flips to the new address only when its cached copy expires, and all 20 have it after one TTL.",
  limits:
    "Twenty resolvers stand for the many real ones, and their copies are drawn evenly aged across the TTL, which assumes the old answer was being looked up steadily before the change. Real resolvers differ: some ignore low TTLs, some keep expired answers for a while, and browsers and apps cache too. Only the 60 second TTL comes from a real service (an AWS load balancer record); 5 minutes, 1 hour and 1 day are examples.",
  component: TtlSpreadCanvas,
};

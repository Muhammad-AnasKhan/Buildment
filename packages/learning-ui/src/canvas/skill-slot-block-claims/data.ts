import type { CustomCanvasSpec } from "../registry";
import { SkillSlotBlockClaimsCanvas } from "./SkillSlotBlockClaimsCanvas";

export const skillSlotBlockClaims: CustomCanvasSpec = {
  kind: "custom",
  title: "Which blocks does this booking need?",
  purpose: "Place a service and its cleanup buffer on a provider grid, then move existing claims to see overlap.",
  limits: "This is one provider on a fixed UTC 15-minute grid. It shows candidate overlap with two visible claims. It does not read MongoDB, resolve a provider's local rule, handle a live clock, perform a transaction or guarantee a booking. Checkout must revalidate and insert the full claim set under the unique index.",
  component: SkillSlotBlockClaimsCanvas,
};

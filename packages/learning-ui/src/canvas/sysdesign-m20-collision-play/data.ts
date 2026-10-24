import type { CustomCanvasSpec } from "../registry";
import { CollisionPlayCanvas } from "./CollisionPlayCanvas";

// 20.3 beat 2: how full the keyspace is decides how often a random code clashes.
// Model: models/wasla-collision.ts.
export const sysdesignM20CollisionPlay: CustomCanvasSpec = {
  kind: "custom",
  title: "Drag the length, watch the clashes",
  purpose: "Drag the code length from 4 to 9 characters and the stored links from a thousand to 30 billion, and watch the share of codes already taken, the retries it causes and where the first clash is expected.",
  limits:
    "Codes are drawn at random from 62 letters and digits, and every code is equally likely. Real generators may skew, and a database also holds reserved or custom names. The retry count is the average for a create made when the keyspace is that full; it assumes one try after another with no limit. The first-clash marker is the standard birthday estimate, 1.2533 times the square root of the possible codes, a typical value and not a promise. The extra tries a second use 193 creates a second.",
  component: CollisionPlayCanvas,
};

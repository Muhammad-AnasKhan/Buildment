import type { CustomCanvasSpec } from "../registry";
import { RevokeTimelineCanvas } from "./RevokeTimelineCanvas";

// 6.7 beat 4: a seller is banned and keeps sending requests. Sessions refuse
// the next one, signed tokens alone keep working until they expire, and a
// denylist refreshed every 10 seconds closes the gap to that refresh time.
// Model: models/revoke-timeline.ts.
export const sysdesignM6RevokeTimeline: CustomCanvasSpec = {
  kind: "custom",
  title: "Ban a seller: who notices, and when?",
  purpose: "Ban a seller and watch when sessions, signed tokens and a denylist each start to refuse them; drag the token lifetime to change the gap.",
  limits:
    "The 15-minute lifetime and the 10-second refresh are made-up Kitabi settings. Short access tokens with revocable refresh tokens behave like the tokens-only lane with a small lifetime.",
  component: RevokeTimelineCanvas,
};

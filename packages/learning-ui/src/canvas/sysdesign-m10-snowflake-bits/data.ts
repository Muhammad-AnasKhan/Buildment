import type { CustomCanvasSpec } from "../registry";
import { SnowflakeBitsCanvas } from "./SnowflakeBitsCanvas";

// 10.7 ("ID generation at scale"), beat 5 "Change the bits, then break the clock".
// Model: models/snowflake-bits.ts.
export const sysdesignM10SnowflakeBits: CustomCanvasSpec = {
  kind: "custom",
  title: "The bits of an ID are a budget",
  purpose: "Move bits between the machine number and the count, and step the clock back to see what each way of handling it does.",
  limits:
    "63 usable bits, 20 IDs asked for every millisecond, and a made-up wait limit of 10 ms for the careful generator. A real generator also has to keep machine numbers unique, and it must survive a restart.",
  component: SnowflakeBitsCanvas,
};

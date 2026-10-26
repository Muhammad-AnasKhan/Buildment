// The parameters of every mode of the address renderer in one place: the
// modes of modules 2 (net-address.ts) plus the modes of modules 3 and 9
// (`mask-and`, `split`, `overlap`, `v6`). Each is plain, serialisable data
// checked by a zod schema, so the same parameters can arrive from a Markdown
// `canvas` fence without new code.

import { z } from "zod";
import { addrConfigSchema } from "./net-address";
import { maskConfigSchema, overlapConfigSchema, splitConfigSchema } from "./net-subnet";
import { v6ConfigSchema } from "./net-ipv6";

export const subnetModeSchema = z.discriminatedUnion("mode", [maskConfigSchema, splitConfigSchema, overlapConfigSchema, v6ConfigSchema]);
export type SubnetModeConfig = z.infer<typeof subnetModeSchema>;

/** Every mode that takes parameters, old and new. */
export const anyAddrConfigSchema = z.union([addrConfigSchema, subnetModeSchema]);
export type AnyAddrConfig = z.infer<typeof anyAddrConfigSchema>;

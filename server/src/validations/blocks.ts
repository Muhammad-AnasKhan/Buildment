import { z } from "zod";
import { params } from "./common.js";

export const respondParams = params("blockId");

// The payload shape depends on the block type; the service parses it with the
// block's own schema in src/shared. Here we only insist on an object.
export const respondBody = z.record(z.string(), z.unknown());

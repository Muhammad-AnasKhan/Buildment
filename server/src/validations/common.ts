import { z } from "zod";

export const id = z.string().trim().min(1);
export const email = z.string().trim().email().transform((value) => value.toLowerCase());

/** `{ [name]: id }` param schema, e.g. `params("blockId")`. */
export function params<Name extends string>(name: Name) {
  return z.object({ [name]: id } as Record<Name, typeof id>);
}

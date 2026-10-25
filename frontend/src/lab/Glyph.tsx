// The glyph of a component kind. The glyphs themselves live in the shared UI package.

import type { ComponentKind } from "./catalog";
import { roleOf } from "./catalog";
import { Glyph } from "@buildment/learning-ui/lab-ui";

export function KindGlyph({ kind, size = 18 }: { kind: ComponentKind; size?: number }) {
  return <Glyph role={roleOf(kind)} size={size} />;
}

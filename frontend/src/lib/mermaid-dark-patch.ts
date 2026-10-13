/** Course Mermaid charts use light semantic fills — remap for dark mode after render. */

const SEMANTIC_FILL: Record<string, string> = {
  "#ecfdf5": "#1a2e24",
  "#eef2ff": "#1e2030",
  "#fff7ed": "#2a2218",
  "#fef2f2": "#2a1818",
  "#f0fdf4": "#1a2e24",
  "#eff6ff": "#1e2030",
  "#fefce8": "#2a2418",
  "#ffffff": "#2a2620",
  "#fff": "#2a2620",
  "#f9fafb": "#242018",
  "#f5f6f7": "#2a2620",
  "#f3f4f6": "#2a2620",
};

const SEMANTIC_STROKE: Record<string, string> = {
  "#10b981": "#34d399",
  "#6366f1": "#a5b4fc",
  "#f59e0b": "#fbbf24",
  "#ef4444": "#f87171",
  "#22c55e": "#4ade80",
  "#3b82f6": "#60a5fa",
};

function normalizeHex(hex: string): string {
  const raw = hex.startsWith("#") ? hex.slice(1) : hex;
  if (raw.length === 3) {
    return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase();
  }
  return `#${raw.toLowerCase()}`;
}

function mapHex(hex: string, table: Record<string, string>): string {
  const key = normalizeHex(hex);
  return table[key] ?? hex;
}

function patchInlineHex(svg: string, attr: "fill" | "stroke", table: Record<string, string>) {
  const quoted = new RegExp(`${attr}="(#([0-9a-fA-F]{3,8}))"`, "gi");
  let out = svg.replace(quoted, (_full, _withHash, hex) => {
    const mapped = mapHex(`#${hex}`, table);
    return `${attr}="${mapped}"`;
  });
  const bare = new RegExp(`${attr}:([#])([0-9a-fA-F]{3,8})`, "gi");
  out = out.replace(bare, (_full, hash, hex) => {
    const mapped = mapHex(`${hash}${hex}`, table);
    return `${attr}:${mapped}`;
  });
  return out;
}

function replaceStyleDeclarations(svg: string) {
  return svg.replace(/style="([^"]*)"/g, (full, body: string) => {
    let next = body.replace(/fill:([#][0-9a-fA-F]{3,8})/gi, (_m, hex: string) => {
      return `fill:${mapHex(hex, SEMANTIC_FILL)}`;
    });
    next = next.replace(/stroke:([#][0-9a-fA-F]{3,8})/gi, (_m, hex: string) => {
      return `stroke:${mapHex(hex, SEMANTIC_STROKE)}`;
    });
    next = next.replace(/color\s*:\s*#(?:1f2937|111827|374151|24292f)/gi, "color:#f3eee6");
    return next === body ? full : `style="${next}"`;
  });
}

export function patchMermaidSvgForDarkMode(svg: string): string {
  let out = svg;
  out = patchInlineHex(out, "fill", SEMANTIC_FILL);
  out = patchInlineHex(out, "stroke", SEMANTIC_STROKE);
  out = replaceStyleDeclarations(out);
  return out;
}

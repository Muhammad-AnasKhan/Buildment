// 18.3 beat 2: a Docker build reuses every layer above the first changed one and
// rebuilds everything from there. Two Dockerfiles for the same service: A copies
// everything first, B copies the package files first. Times are round numbers
// close to the course measurement (challenge 17), where the install is the slow
// layer. Times are kept in tenths of a second so sums are exact.

export type FileId = "readme" | "server" | "package";
export type OrderId = "A" | "B";

export const FILES: readonly { id: FileId; label: string; note: string; full: string }[] = [
  { id: "readme", label: "README.md", note: "ignored", full: "README.md, listed in .dockerignore" },
  { id: "server", label: "server.js", note: "code", full: "server.js, the code" },
  { id: "package", label: "package.json", note: "dependency", full: "package.json, a new dependency" },
];

export const ORDERS: readonly { id: OrderId; label: string; title: string }[] = [
  { id: "A", label: "Copy all first", title: "Dockerfile A: copy everything first" },
  { id: "B", label: "Packages first", title: "Dockerfile B: package files first" },
];

export type Layer = {
  id: string;
  label: string;
  /** Build time in tenths of a second when the layer is rebuilt. */
  tenths: number;
  /** Files whose change invalidates this layer. A file in .dockerignore is never listed. */
  reads: readonly FileId[];
};

const FROM: Layer = { id: "from", label: "FROM node:24-alpine", tenths: 0, reads: [] };
const CMD: Layer = { id: "cmd", label: "CMD node server.js", tenths: 0, reads: [] };

/** The layers of a Dockerfile, first instruction first. */
export function layersOf(order: OrderId): readonly Layer[] {
  if (order === "A") {
    return [
      FROM,
      { id: "copy-all", label: "COPY . .", tenths: 3, reads: ["server", "package"] },
      { id: "install", label: "RUN npm install", tenths: 80, reads: [] },
      CMD,
    ];
  }
  return [
    FROM,
    { id: "copy-pkg", label: "COPY package*.json ./", tenths: 1, reads: ["package"] },
    { id: "ci", label: "RUN npm ci", tenths: 80, reads: [] },
    { id: "copy-src", label: "COPY server.js ./", tenths: 3, reads: ["server"] },
    CMD,
  ];
}

/** The first layer whose input changed, or -1 when the change never reaches the build. */
export function firstChanged(order: OrderId, file: FileId): number {
  return layersOf(order).findIndex((l) => l.reads.includes(file));
}

/** For each layer: rebuilt (the first changed layer and every layer after it) or cached. */
export function rebuiltFlags(order: OrderId, file: FileId): boolean[] {
  const first = firstChanged(order, file);
  return layersOf(order).map((_, i) => first !== -1 && i >= first);
}

/** Total build time in tenths of a second: the sum of the rebuilt layers. */
export function totalTenths(order: OrderId, file: FileId): number {
  const flags = rebuiltFlags(order, file);
  return layersOf(order).reduce((sum, l, i) => sum + (flags[i] ? l.tenths : 0), 0);
}

export const rebuiltLabels = (order: OrderId, file: FileId): string[] => {
  const flags = rebuiltFlags(order, file);
  return layersOf(order).filter((_, i) => flags[i]).map((l) => l.label);
};

/** "8.3 s" for 83 tenths; "0 s" for none. */
export const formatTenths = (tenths: number) => (tenths <= 0 ? "0 s" : `${(tenths / 10).toFixed(1)} s`);

export type Verdict = { text: string; tone: "good" | "warn" | "bad" | "accent" };

export function verdictFor(order: OrderId, file: FileId): Verdict {
  if (file === "readme") return { text: "Nothing changed: all layers cached", tone: "good" };
  if (file === "package") return { text: "Install reruns: dependencies changed", tone: "warn" };
  if (order === "B") return { text: "Only the last copy step runs", tone: "good" };
  return { text: "Everything after the copy reruns", tone: "warn" };
}

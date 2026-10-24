#!/usr/bin/env node
// The contract code both apps run (block schemas and graders, API wire types,
// enums, MDX extraction, pure helpers) is owned by the server in src/shared.
// The web app deploys on its own, so it carries a committed copy under
// frontend/src/shared. This script refreshes that copy; `--check` fails when
// the copy is stale, which CI runs on every push.
//
//   pnpm sync-shared          # from server/
//   pnpm sync-shared:check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = path.resolve(here, "../src/shared");
const TARGET = path.resolve(here, "../../frontend/src/shared");
const HEADER = "// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.\n";
const check = process.argv.includes("--check");

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

/** Next.js resolves extension-less relative imports; the server needs the `.js` suffix. */
const forFrontend = (source) => HEADER + source.replace(/(from\s+["'])(\.{1,2}\/[^"']+)\.js(["'])/g, "$1$2$3");

const expected = new Map();
for (const file of walk(SOURCE)) {
  if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
  expected.set(path.relative(SOURCE, file), forFrontend(fs.readFileSync(file, "utf8")));
}

const actual = new Map();
// The shared UI ships only the browser-safe contracts it consumes.
const uiRoot = path.resolve(here, '../../packages/learning-ui');
const uiContracts = JSON.parse(fs.readFileSync(path.join(uiRoot, 'contracts.json'), 'utf8'));
for (const rel of uiContracts) {
  const source = expected.get(rel.split('/').join(path.sep));
  if (source === undefined) throw new Error(`Unknown learning-ui contract: ${rel}`);
  const destination = path.join(uiRoot, 'src/shared', rel);
  const existing = fs.existsSync(destination) ? fs.readFileSync(destination, 'utf8') : null;
  if (existing !== source) {
    if (check) {
      console.error(`learning-ui contract is stale: ${rel}. Run pnpm sync-shared in server/.`);
      process.exit(1);
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, source);
  }
}
if (fs.existsSync(TARGET)) {
  for (const file of walk(TARGET)) actual.set(path.relative(TARGET, file), fs.readFileSync(file, "utf8"));
}

const stale = [...expected].filter(([rel, content]) => actual.get(rel) !== content).map(([rel]) => rel);
const extra = [...actual.keys()].filter((rel) => !expected.has(rel));

if (check) {
  if (stale.length || extra.length) {
    console.error("frontend/src/shared is out of date. Run `pnpm sync-shared` in server/ and commit the result.");
    for (const rel of stale) console.error(`  stale: ${rel}`);
    for (const rel of extra) console.error(`  extra: ${rel}`);
    process.exit(1);
  }
  console.log("frontend/src/shared is in sync.");
  process.exit(0);
}

for (const rel of extra) fs.rmSync(path.join(TARGET, rel));
for (const rel of stale) {
  const dest = path.join(TARGET, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, expected.get(rel));
}
// Drop directories emptied by removals.
for (const dir of walk(TARGET).map(path.dirname).sort((a, b) => b.length - a.length)) {
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
}
console.log(`synced ${expected.size} files (${stale.length} written, ${extra.length} removed)`);

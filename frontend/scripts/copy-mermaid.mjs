import fs from "node:fs";
import path from "node:path";

const src = path.join(process.cwd(), "node_modules/mermaid/dist/mermaid.min.js");
const destDir = path.join(process.cwd(), "public/vendor");
const dest = path.join(destDir, "mermaid.min.js");

if (!fs.existsSync(src)) {
  console.warn("copy-mermaid: mermaid dist not found, skipping");
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);

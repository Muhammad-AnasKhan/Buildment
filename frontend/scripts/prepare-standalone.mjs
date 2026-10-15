import { cpSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const standalone = path.join(root, ".next/standalone");

// Next's standalone output excludes assets; include them for direct Node hosting.
cpSync(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
cpSync(path.join(root, ".next/static"), path.join(standalone, ".next/static"), {
  recursive: true,
});

/**
 * Generate FreshMarket "What you'll build" showcase screenshots via Google Stitch MCP.
 * Saves PNGs to public/showcase/multi-vendor-marketplace/.
 *
 * Requires STITCH_API_KEY env var (from Cursor MCP config — never commit the key).
 * Run: STITCH_API_KEY=... node scripts/generate-showcase-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/showcase/multi-vendor-marketplace");
const MCP_URL = "https://stitch.googleapis.com/mcp";
const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? "5086730330133580426";
const MODEL_ID = process.env.STITCH_MODEL_ID ?? "GEMINI_3_FLASH";
const DESIGN_SYSTEM = process.env.STITCH_DESIGN_SYSTEM ?? "";

const SCREENS = [
  {
    id: "storefront",
    filename: "storefront.png",
    prompt: `Design a desktop web application UI screenshot for "FreshMarket" — a multi-vendor local grocery marketplace customer storefront.

Include: top navigation with FreshMarket logo and search, shopping cart badge showing 3 items, category filter chips (Produce, Bakery, Pantry), and a responsive product grid with grocery cards showing organic avocados ($4.99), sourdough bread ($6.50), wildflower honey ($12.00) with vendor names and In stock / Low stock badges.

Style: light white background, indigo (#4F46E5) accent, modern SaaS quality, generous whitespace, Inter typography. Production-ready UI mockup — not wireframe, not dark theme.`,
  },
  {
    id: "vendor",
    filename: "vendor-dashboard.png",
    prompt: `Design a desktop web application UI screenshot for "FreshMarket" vendor dashboard where grocery shop owners manage their store.

Include: left sidebar (Dashboard, Products, Orders, Settings), stat cards showing Active listings 18, Pending orders 4, Revenue $842.10, a products table with thumbnails and stock counts, and recent orders with status badges (Preparing, Ready).

Style: light white background, indigo (#4F46E5) accent, clean SaaS dashboard, Inter typography. Production-ready — not wireframe, not dark theme.`,
  },
  {
    id: "checkout",
    filename: "checkout-orders.png",
    prompt: `Design a desktop web application UI screenshot for FreshMarket checkout and order tracking.

Include: checkout summary panel with items split across 2 vendors, Stripe secure payment section, and an order tracking panel with Order #ORD-1042 (Paid), #ORD-1041 (In progress), #ORD-1039 (Delivered) with colored status badges.

Style: light white background, indigo (#4F46E5) accent, professional grocery marketplace SaaS UI. Production-ready — not wireframe, not dark theme.`,
  },
];

async function stitchCall(toolName, args) {
  const key = process.env.STITCH_API_KEY;
  if (!key) {
    throw new Error("Set STITCH_API_KEY (from ~/.cursor/mcp.json stitch headers)");
  }

  const res = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      "X-Goog-Api-Key": key,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: { name: toolName, arguments: args },
    }),
  });

  const data = await res.json();
  if (data.result?.isError) {
    const msg = data.result.content?.map((c) => c.text).join("\n") ?? "Unknown Stitch error";
    throw new Error(`${toolName} failed: ${msg}`);
  }
  return data.result;
}

function extractGeneration(result) {
  const textBlock = result.content?.find((c) => c.type === "text" && c.text.startsWith("{"));
  const parsed = textBlock
    ? JSON.parse(textBlock.text)
    : { outputComponents: result.structuredContent?.outputComponents ?? [] };

  let screenshotUrl;
  let designSystem;

  for (const component of parsed.outputComponents ?? []) {
    designSystem ??= component.designSystem?.name;
    const screens = component.design?.screens ?? [];
    screenshotUrl ??= screens[0]?.screenshot?.downloadUrl;
  }

  if (!screenshotUrl) {
    throw new Error("Could not find screenshot.downloadUrl in Stitch response");
  }

  return { screenshotUrl, designSystem };
}

async function generateScreen(prompt, designSystem) {
  console.log("  Generating (typically 1–3 min)...");
  const args = { projectId: PROJECT_ID, prompt, modelId: MODEL_ID };
  if (designSystem) args.designSystem = designSystem;

  const result = await stitchCall("generate_screen_from_text", args);
  return extractGeneration(result);
}

async function downloadImage(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Stitch project: ${PROJECT_ID}`);
  console.log(`Model: ${MODEL_ID}`);
  console.log(`Output: ${OUT_DIR}\n`);

  let designSystem = DESIGN_SYSTEM;

  for (const screen of SCREENS) {
    console.log(`→ ${screen.id}`);
    const { screenshotUrl, designSystem: nextDesignSystem } = await generateScreen(
      screen.prompt,
      designSystem || undefined
    );
    if (!designSystem && nextDesignSystem) {
      designSystem = nextDesignSystem;
      console.log(`  Design system: ${designSystem}`);
    }
    const dest = path.join(OUT_DIR, screen.filename);
    await downloadImage(screenshotUrl, dest);
    console.log(`  Saved: public/showcase/multi-vendor-marketplace/${screen.filename}\n`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

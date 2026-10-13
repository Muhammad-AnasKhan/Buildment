/**
 * Generate additional FreshMarket chapter UI screenshots via Google Stitch MCP.
 * Uses the design system from the first showcase batch for visual consistency.
 *
 * Run: STITCH_API_KEY=... node scripts/generate-chapter-screens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/showcase/multi-vendor-marketplace");
const MCP_URL = "https://stitch.googleapis.com/mcp";
const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? "5086730330133580426";
const MODEL_ID = process.env.STITCH_MODEL_ID ?? "GEMINI_3_FLASH";
/** From first showcase run — keeps chapter screens visually consistent */
const DESIGN_SYSTEM =
  process.env.STITCH_DESIGN_SYSTEM ?? "assets/c5ab0108598045b680e0f42c491fbc2b";

const SCREENS = [
  {
    id: "cart",
    filename: "cart-page.png",
    prompt: `Design a desktop web UI screenshot for FreshMarket customer cart page.

Show: header with FreshMarket logo and cart badge "3", page title "Your cart", TWO vendor sections — "Green Valley Grocers" with Basmati Rice and Milk line items with quantities and subtotal, and "Spice Corner" with Turmeric, estimated grand total at bottom, disabled "Proceed to checkout" or green checkout button.

Style: light white background, indigo (#4F46E5) accent, Inter typography, modern grocery marketplace SaaS. Production-ready UI mockup — not wireframe, not dark theme.`,
  },
  {
    id: "product-detail",
    filename: "product-detail.png",
    prompt: `Design a desktop web UI screenshot for FreshMarket product detail page.

Show: large product photo of basmati rice, title "Basmati Rice", price "₹120 / kg", "Sold by Green Valley Grocers", short description, quantity selector, orange "Add to cart" button, back link to shop.

Style: light white background, indigo (#4F46E5) accent, Inter typography. Production-ready grocery marketplace UI — not wireframe.`,
  },
  {
    id: "checkout",
    filename: "checkout-page.png",
    prompt: `Design a desktop web UI screenshot for FreshMarket checkout page.

Show: order review with two vendor sections (Green Valley subtotal, Spice Corner subtotal), grand total, Stripe payment card form area, green "Pay and place order" button. Multi-vendor grocery marketplace checkout.

Style: light white background, indigo (#4F46E5) accent, Inter typography. Production-ready — not wireframe, not dark theme.`,
  },
  {
    id: "vendor-open-shop",
    filename: "vendor-open-shop.png",
    prompt: `Design a desktop web UI screenshot for FreshMarket vendor onboarding "Open your shop" form.

Show: vendor sidebar nav, main form with title "Open your shop", fields Shop name, Description, Address, orange "Create shop" button. First-time vendor setup screen.

Style: light white background, indigo (#4F46E5) accent, Inter typography. Production-ready SaaS vendor portal — not wireframe.`,
  },
];

async function stitchCall(toolName, args) {
  const key = process.env.STITCH_API_KEY;
  if (!key) throw new Error("Set STITCH_API_KEY");

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
  for (const component of parsed.outputComponents ?? []) {
    const screens = component.design?.screens ?? [];
    screenshotUrl ??= screens[0]?.screenshot?.downloadUrl;
  }
  if (!screenshotUrl) throw new Error("No screenshot.downloadUrl in response");
  return screenshotUrl;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Design system: ${DESIGN_SYSTEM}\n`);

  for (const screen of SCREENS) {
    console.log(`→ ${screen.id}`);
    console.log("  Generating (typically 1–3 min)...");
    const result = await stitchCall("generate_screen_from_text", {
      projectId: PROJECT_ID,
      prompt: screen.prompt,
      modelId: MODEL_ID,
      designSystem: DESIGN_SYSTEM,
    });
    const url = extractGeneration(result);
    const dest = path.join(OUT_DIR, screen.filename);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  Saved: public/showcase/multi-vendor-marketplace/${screen.filename}\n`);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

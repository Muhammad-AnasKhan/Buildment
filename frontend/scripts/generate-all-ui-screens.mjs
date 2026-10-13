/**
 * Generate all FreshMarket UI screen previews via Google Stitch MCP.
 * Skips files that already exist unless FORCE=1.
 *
 * STITCH_API_KEY=... node scripts/generate-all-ui-screens.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/showcase/multi-vendor-marketplace");
const MCP_URL = "https://stitch.googleapis.com/mcp";
const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? "5086730330133580426";
const MODEL_ID = process.env.STITCH_MODEL_ID ?? "GEMINI_3_FLASH";
const DESIGN_SYSTEM =
  process.env.STITCH_DESIGN_SYSTEM ?? "assets/c5ab0108598045b680e0f42c491fbc2b";
const FORCE = process.env.FORCE === "1";

const STYLE =
  "Style: light white background, indigo (#4F46E5) accent, Inter typography, modern grocery marketplace SaaS. Production-ready UI mockup — not wireframe, not dark theme.";

const SCREENS = [
  {
    filename: "login-page.png",
    prompt: `FreshMarket login page. Email and password fields, "Log in" button, link to register, forgot password hint. ${STYLE}`,
  },
  {
    filename: "register-page.png",
    prompt: `FreshMarket sign up page. Email field, password field, role dropdown with Customer and Vendor options, Create account button, link to log in. ${STYLE}`,
  },
  {
    filename: "verify-otp-page.png",
    prompt: `FreshMarket email verification page. Title "Verify your email", 6-digit OTP input boxes, email shown, "Verify" button, resend link. ${STYLE}`,
  },
  {
    filename: "store-settings-page.png",
    prompt: `FreshMarket vendor store settings page. Sidebar nav, form pre-filled with shop name "Green Valley Grocers", description, address, logo URL, "Save changes" button, success message area. ${STYLE}`,
  },
  {
    filename: "create-product-page.png",
    prompt: `FreshMarket vendor "Add product" form. Fields: product name, description, price, unit dropdown (kg), stock quantity, perishable checkbox, helper "New products start as drafts", orange Save product button. ${STYLE}`,
  },
  {
    filename: "edit-product-page.png",
    prompt: `FreshMarket vendor edit product page. Pre-filled Basmati Rice, price, stock, Published toggle switch ON, Save button, image thumbnail area. ${STYLE}`,
  },
  {
    filename: "product-upload.png",
    prompt: `FreshMarket edit product page with image upload section. Product photo thumbnail, "Choose file" and Upload button, drag-drop zone, product name Basmati Rice visible. ${STYLE}`,
  },
  {
    filename: "order-confirmation-page.png",
    prompt: `FreshMarket order confirmation page. "Thank you — your orders are placed", TWO order cards from Green Valley and Spice Corner with line items and totals, status Pending badges, link to order history. ${STYLE}`,
  },
  {
    filename: "customer-orders-page.png",
    prompt: `FreshMarket customer order history page. List of past orders with order id, store name, date, total, status badges, line items with prices. ${STYLE}`,
  },
  {
    filename: "vendor-orders-page.png",
    prompt: `FreshMarket vendor orders inbox. Table of incoming orders with order id, customer name, items summary, total, status dropdown Preparing/Ready, update status button. ${STYLE}`,
  },
  {
    filename: "production-live-site.png",
    prompt: `FreshMarket production deployment success view. Browser showing live HTTPS grocery marketplace homepage with green secure lock, deployed URL bar, shop grid loading, subtle "Deployed on AWS" badge in footer. ${STYLE}`,
  },
  {
    filename: "marketplace-overview.png",
    prompt: `FreshMarket marketplace marketing landing hero. Split view hint: customer browsing groceries on left, vendor dashboard snippet on right, headline "Local groceries from many shops, one checkout". ${STYLE}`,
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
    const msg = data.result.content?.map((c) => c.text).join("\n") ?? "Unknown error";
    throw new Error(`${toolName}: ${msg}`);
  }
  return data.result;
}

function extractUrl(result) {
  const textBlock = result.content?.find((c) => c.type === "text" && c.text.startsWith("{"));
  const parsed = textBlock
    ? JSON.parse(textBlock.text)
    : { outputComponents: result.structuredContent?.outputComponents ?? [] };
  for (const component of parsed.outputComponents ?? []) {
    const url = component.design?.screens?.[0]?.screenshot?.downloadUrl;
    if (url) return url;
  }
  throw new Error("No screenshot URL");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let generated = 0;
  let skipped = 0;

  for (const screen of SCREENS) {
    const dest = path.join(OUT_DIR, screen.filename);
    if (!FORCE && fs.existsSync(dest)) {
      console.log(`⏭ skip ${screen.filename} (exists)`);
      skipped++;
      continue;
    }
    console.log(`→ ${screen.filename}`);
    console.log("  Generating (~1–3 min)...");
    const result = await stitchCall("generate_screen_from_text", {
      projectId: PROJECT_ID,
      prompt: screen.prompt,
      modelId: MODEL_ID,
      designSystem: DESIGN_SYSTEM,
    });
    const url = extractUrl(result);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download ${screen.filename} failed`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`  ✓ saved\n`);
    generated++;
  }

  console.log(`Done. Generated: ${generated}, skipped: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { tmpdir } from "node:os";
import { renderEmailLayout, renderEmailTemplate } from "../src/services/email/render.js";

// Generates a local example only; no messages are sent and no real tokens are used.
const directory = resolve(process.argv[2] ?? join(tmpdir(), "buildment-email-preview"));
const url = "https://buildment.example/api/v1/auth/confirm-email?token=preview-only";
const html = await renderEmailTemplate("send-verification-email", { greeting: " Alex", url });
await mkdir(directory, { recursive: true });
const output = join(directory, "verification.html");
await writeFile(output, await renderEmailLayout({
  subject: "Verify your Buildment email", html,
  text: "Welcome to Buildment. Confirm your email address to finish setting up your account.",
}, "https://buildment.example"));
console.log(output);

// Render a few emails to HTML files for a quick look in a browser.
// Usage: pnpm exec tsx scripts/preview-emails.ts <out-dir> [app-url]
// Pass the web app's URL (or file:///.../frontend/public) so the wordmark and Dot load.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderEmailLayout, renderEmailTemplate } from "../src/services/email/render.js";

const [outDir = "email-previews", appUrl = "http://localhost:3000"] = process.argv.slice(2);
const url = `${appUrl}/dashboard`;

const samples = [
  { file: "magic-link", subject: "Your Edorax sign-in link", template: "request-magic-link", data: { url }, text: "Tap to sign in." },
  { file: "verify", subject: "Verify your Edorax email", template: "send-verification-email", data: { greeting: " Amal", url }, text: "Confirm your email." },
  { file: "missed-you", subject: "I missed you!", template: "send-inactivity-nudges-for-course", data: { name: "Amal", courseTitle: "Computer networking" }, text: "Your course is right where you left it." },
  { file: "weekly-goal", subject: "Your weekly goal", template: "run-weekly-goal-reminders", data: { name: "Amal", progress: 2, target: 3, unit: "lessons", remaining: 1, note: null, url }, text: "One lesson to go." },
  { file: "enrolled", subject: "You're enrolled in Computer networking", template: "notify-mentee-course-enrollment", data: { name: "Amal", mentorName: "Zee", courseTitle: "Computer networking", url }, text: "Start the course." },
];

await mkdir(outDir, { recursive: true });
for (const s of samples) {
  const html = await renderEmailTemplate(s.template, { ...s.data, appUrl });
  const page = await renderEmailLayout({ subject: s.subject, html, text: s.text }, appUrl);
  await writeFile(path.join(outDir, `${s.file}.html`), page);
  console.log("wrote", path.join(outDir, `${s.file}.html`));
}

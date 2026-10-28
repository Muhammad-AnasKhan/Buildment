import ejs from "ejs";
import { fileURLToPath } from "node:url";

// Same value and default as env.APP_URL, read directly so rendering a template does not
// load (and validate) the whole server config.
const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

/**
 * Only application-owned template names and explicitly constructed data belong here.
 * `appUrl` is always available, so templates can link to the app and its brand images
 * (the wordmark and Dot live under /brand in the web app).
 */
export async function renderEmailTemplate(name: string, data: Record<string, unknown>): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error("Invalid email template name");
  return ejs.renderFile(fileURLToPath(new URL(`./templates/${name}.ejs`, import.meta.url)), { appUrl: APP_URL, ...data }, {});
}

export async function renderEmailLayout(input: { subject: string; html: string; text: string }, appUrl: string): Promise<string> {
  return renderEmailTemplate("layout", {
    title: input.subject,
    preheader: input.text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 140),
    body: input.html,
    appUrl,
  });
}

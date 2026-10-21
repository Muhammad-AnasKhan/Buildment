import ejs from "ejs";
import { fileURLToPath } from "node:url";

/** Only application-owned template names and explicitly constructed data belong here. */
export async function renderEmailTemplate(name: string, data: Record<string, unknown>): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error("Invalid email template name");
  return ejs.renderFile(fileURLToPath(new URL(`./templates/${name}.ejs`, import.meta.url)), data, {});
}

export async function renderEmailLayout(input: { subject: string; html: string; text: string }, appUrl: string): Promise<string> {
  return renderEmailTemplate("layout", {
    title: input.subject,
    preheader: input.text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 140),
    body: input.html,
    appUrl,
  });
}

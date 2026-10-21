import { describe, expect, it } from "vitest";
import { readdir } from "node:fs/promises";
import { renderEmailLayout, renderEmailTemplate } from "../../../../src/services/email/render.js";

const url = "https://buildment.example/verify?token=example&source=email";

describe("EJS emails", () => {
  it("escapes names and preserves the verification action and expiry", async () => {
    const html = await renderEmailTemplate("send-verification-email", { greeting: ' <img src=x onerror="alert(1)">', url });
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
    expect(html).toContain("Verify email");
    expect(html).toContain("24 hours");
    expect(html).toContain("token=example&amp;source=email");
  });

  it("escapes optional request messages and goal notes", async () => {
    const request = await renderEmailTemplate("notify-admins-instructor-access-request", {
      applicant: "Alex", email: "alex@example.com", preview: "<script>bad()</script>", url,
    });
    expect(request).toContain("<blockquote");
    expect(request).not.toContain("<script>");
    const reminder = await renderEmailTemplate("run-weekly-goal-reminders", {
      name: "Alex", progress: 1, target: 3, unit: "sessions", remaining: 2, note: "<b>Focus</b>", url,
    });
    expect(reminder).toContain("&lt;b&gt;Focus&lt;/b&gt;");
    expect(reminder).not.toContain("&lt;p&gt;");
  });

  it("wraps content in a document with escaped title and a token-free preheader", async () => {
    const html = await renderEmailLayout({ subject: "Course <update>", html: "<p>Hello</p>", text: `Sign in: ${url}` }, "https://buildment.example");
    expect(html).toContain('<html lang="en">');
    expect(html).toContain("Course &lt;update&gt;");
    expect(html).toContain("<p>Hello</p>");
    expect(html).not.toContain("token=example");
    expect(html).toContain('role="presentation"');
  });

  it("renders every notification template", async () => {
    const files = await readdir(new URL("../../../../src/services/email/templates/", import.meta.url));
    const data = {
      name: "Alex & Sam", greeting: " Alex", url, fallbackUrl: url, linkText: url, label: "Continue", mentorName: "Mentor", senderName: "Mentor",
      learnerName: "Learner", courseTitle: "TypeScript & Node", lesson: "Introduction", preview: "A question",
      verdict: "approved your answer", applicant: "Alex", email: "alex@example.com", organizationName: "School",
      organizationSlug: "school", role: "Course creator", expiryDays: 14,
      progress: 1, target: 3, unit: "sessions", remaining: 2, note: null,
    };
    for (const file of files.filter((file) => file !== "layout.ejs")) {
      const html = await renderEmailTemplate(file.replace(/\.ejs$/, ""), data);
      expect(html, file).not.toMatch(/<%|undefined/);
    }
  });

  it("rejects template paths outside the template directory", async () => {
    await expect(renderEmailTemplate("../secret", {})).rejects.toThrow("Invalid email template name");
  });
});

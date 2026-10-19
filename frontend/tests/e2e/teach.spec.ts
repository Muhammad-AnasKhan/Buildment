import { test, expect, type Page } from "@playwright/test";

// Instructor surfaces render from /api/v1/teach. Each test signs in as the
// seeded mentor through the dev-login shortcut and checks the page shows data
// only the API could have provided.

const COURSE = "multi-vendor-marketplace";

async function devLogin(page: Page, redirectTo: string) {
  const res = await page.goto(
    `/api/v1/auth/dev-login?email=${encodeURIComponent("mentor@buildment.dev")}&redirectTo=${encodeURIComponent(redirectTo)}`
  );
  expect(res?.ok()).toBeTruthy();
}

test.describe("instructor workspace", () => {
  test("course list, sidebar and course builder render the mentor's course", async ({ page }) => {
    await devLogin(page, "/courses");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/FreshMarket/).first()).toBeVisible();

    await page.goto(`/courses/${COURSE}/edit`);
    await expect(page.getByText(/FreshMarket/).first()).toBeVisible();
    await expect(page.getByText("Course settings")).toBeVisible();
    // The builder lists modules with their chapters from the API.
    await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();
  });

  test("chapter editor opens with the chapter source", async ({ page }) => {
    await devLogin(page, "/courses");
    const chapterId = await page.evaluate(async () => {
      const res = await fetch("/api/v1/teach/courses/multi-vendor-marketplace/builder");
      const body = (await res.json()) as { data: { course: { modules: Array<{ chapters: Array<{ id: string }> }> } } };
      return body.data.course.modules.flatMap((m) => m.chapters)[0]?.id ?? null;
    });
    expect(chapterId).toBeTruthy();

    await page.goto(`/courses/${COURSE}/chapters/${chapterId}/edit`);
    await expect(page.getByRole("button", { name: /publish/i }).first()).toBeVisible({ timeout: 60_000 });
  });

  test("mentees, reports and activity pages load the cohort", async ({ page }) => {
    await devLogin(page, `/courses/${COURSE}/mentees`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Ada Mentee").first()).toBeVisible();

    await page.goto(`/courses/${COURSE}/reports`);
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
    await expect(page.getByRole("link", { name: /export csv/i })).toHaveAttribute(
      "href",
      `/api/v1/teach/courses/${COURSE}/reports/export`
    );

    await page.goto(`/courses/${COURSE}/activity`);
    await expect(page.getByRole("heading", { name: "Daily activity" })).toBeVisible();
    await expect(page.getByText("Active learners")).toBeVisible();
  });

  test("the CSV export downloads through the proxy with the session cookie", async ({ page }) => {
    await devLogin(page, "/courses");
    const csv = await page.evaluate(async () => {
      const res = await fetch("/api/v1/teach/courses/multi-vendor-marketplace/reports/export");
      return { status: res.status, type: res.headers.get("content-type"), text: await res.text() };
    });
    expect(csv.status).toBe(200);
    expect(csv.type).toContain("text/csv");
    expect(csv.text.split("\n")[0]).toMatch(/^name,email,status/);
  });

  test("review queue and help inbox render", async ({ page }) => {
    await devLogin(page, "/review");
    await expect(page.getByRole("heading", { name: "Answers to check" })).toBeVisible();

    await page.goto("/help");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("combobox").first()).toBeVisible();
  });

  test("a learner cannot open the instructor API", async ({ page }) => {
    await page.goto(`/api/v1/auth/dev-login?email=${encodeURIComponent("mentee1@buildment.dev")}&redirectTo=/dashboard`);
    const status = await page.evaluate(async () => (await fetch("/api/v1/teach/workspace")).status);
    expect(status).toBe(403);
  });
});

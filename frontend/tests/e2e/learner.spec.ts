import { test, expect, type Page } from "@playwright/test";

// Learner surfaces render from the API. Each test signs in as a seeded learner
// through the dev-login shortcut (a real session cookie) and checks the page
// shows data that only the API could have provided.

const COURSE = "multi-vendor-marketplace";

async function devLogin(page: Page, email = "mentee1@buildment.dev", redirectTo = "/dashboard") {
  const res = await page.goto(`/api/v1/auth/dev-login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectTo)}`);
  expect(res?.ok()).toBeTruthy();
}

test.describe("learner workspace", () => {
  test("dashboard, courses and progress pages render the learner's data", async ({ page }) => {
    await devLogin(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Learning space")).toBeVisible();
    await expect(page.getByRole("link", { name: /my courses/i }).first()).toBeVisible();

    await page.goto("/my-courses");
    await expect(page.getByRole("heading", { name: "My courses" })).toBeVisible();
    await expect(page.getByText(/FreshMarket/).first()).toBeVisible();

    await page.goto("/progress");
    await expect(page.getByRole("heading", { name: "My progress" })).toBeVisible();
    await expect(page.getByText("Course completion").first()).toBeVisible();
  });

  test("catalog detail and course overview come from the API", async ({ page }) => {
    await devLogin(page, "mentee1@buildment.dev", `/catalog/${COURSE}`);
    await expect(page.getByRole("heading", { name: /FreshMarket/ })).toBeVisible();
    await expect(page.getByText("Curriculum")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to course" })).toBeVisible();

    await page.goto(`/courses/${COURSE}`);
    await expect(page.getByText(/FreshMarket/).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /start learning|continue learning|review course/i })).toBeVisible();
  });

  test("the chapter reader opens the continue target with its content", async ({ page }) => {
    await devLogin(page, "mentee1@buildment.dev", "/dashboard");
    const href = await page.evaluate(async () => {
      const res = await fetch(`/api/v1/courses/multi-vendor-marketplace/continue`);
      const body = (await res.json()) as { data: { href: string | null } };
      return body.data.href;
    });
    expect(href).toMatch(/^\/courses\/multi-vendor-marketplace\//);

    await page.goto(href!);
    await expect(page.locator(".prose").first()).toBeVisible({ timeout: 60_000 });
    await expect(page.getByRole("button", { name: /ask a question/i }).first()).toBeVisible();
  });

  test("questions inbox and profile settings load", async ({ page }) => {
    await devLogin(page, "mentee1@buildment.dev", "/my-questions");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await page.goto("/settings/profile");
    await expect(page.getByRole("heading", { name: "Profile settings" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("mentee1@buildment.dev");
  });
});

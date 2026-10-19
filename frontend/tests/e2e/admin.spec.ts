import { test, expect, type Page } from "@playwright/test";

// Admin surfaces render from /api/v1/admin. Each test signs in as the seeded
// platform admin through the dev-login shortcut.

async function devLogin(page: Page, email: string, redirectTo: string) {
  const res = await page.goto(`/api/v1/auth/dev-login?email=${encodeURIComponent(email)}&redirectTo=${encodeURIComponent(redirectTo)}`);
  expect(res?.ok()).toBeTruthy();
}

test.describe("platform admin", () => {
  test("overview, courses, organizations, requests and users pages render", async ({ page }) => {
    await devLogin(page, "admin@buildment.dev", "/admin");
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
    await expect(page.getByText(/published/).first()).toBeVisible();

    await page.goto("/admin/courses");
    await expect(page.getByRole("heading", { name: "Courses" })).toBeVisible();
    await expect(page.getByText(/FreshMarket/).first()).toBeVisible();

    await page.goto("/admin/organizations");
    await expect(page.getByRole("heading", { name: "Organizations" })).toBeVisible();

    await page.goto("/admin/requests");
    await expect(page.getByRole("heading", { name: "Course requests" })).toBeVisible();

    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByText("mentor@buildment.dev")).toBeVisible();
  });

  test("a mentor is refused by the admin API", async ({ page }) => {
    await devLogin(page, "mentor@buildment.dev", "/courses");
    const status = await page.evaluate(async () => (await fetch("/api/v1/admin/overview")).status);
    expect(status).toBe(403);
  });
});

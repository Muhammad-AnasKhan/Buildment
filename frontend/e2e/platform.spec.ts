import { test, expect } from "@playwright/test";

test.describe("Buildment platform smoke", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("integration API catalog is public", async ({ request }) => {
    const res = await request.get("/integrations/v1");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.version).toBe("v1");
    expect(Array.isArray(body.endpoints)).toBe(true);
    expect(body.endpoints.some((e: { path: string }) => e.path.includes("enrollments"))).toBe(
      true
    );
  });

  test("integration connection requires credentials", async ({ request }) => {
    const res = await request.get("/integrations/v1/connection");
    expect(res.status()).toBe(401);
  });

  test("learner can open catalog after dev login", async ({ page }) => {
    const email = "mentee1@buildment.dev";
    const login = await page.goto(`/api/dev-login?email=${encodeURIComponent(email)}&redirectTo=/catalog`);
    expect(login?.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { name: /course catalog/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});

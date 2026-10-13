import { test, expect, type Page } from "@playwright/test";

// Auth flows end to end: the login/signup pages are Server Components whose
// actions call the API, store the session cookie, and redirect — so these tests
// exercise the proxy, the API and the cookie handling together.

const SEED_PASSWORD = "buildment-dev";

/** Asks the API who the browser is, using the page's own cookie jar. */
async function whoAmI(page: Page): Promise<string | null> {
  return page.evaluate(async () => {
    const res = await fetch("/api/v1/auth/me");
    if (!res.ok) return null;
    const body = (await res.json()) as { data: { user: { email: string } } };
    return body.data.user.email;
  });
}

test.describe("password sign-in", () => {
  test("rejects a wrong password with a readable message", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("mentee1@buildment.dev");
    await page.getByLabel("Password", { exact: true }).fill("not-the-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/login\?error=INVALID_CREDENTIALS/);
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
  });

  test("signs a seeded learner in, shows the dashboard, and signs out", async ({ page }) => {
    test.setTimeout(120_000); // first dashboard compile on a cold dev server is slow
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill("mentee1@buildment.dev");
    await page.getByLabel("Password", { exact: true }).fill(SEED_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    expect(await whoAmI(page)).toBe("mentee1@buildment.dev");

    await page.setViewportSize({ width: 1400, height: 900 });
    // The sidebar button is a client handler; on a cold dev server hydration can
    // land after the first paint, so retry the click until it navigates. The inner
    // wait must outlast the action round-trip or the retry re-clicks mid-redirect.
    await expect(async () => {
      await page.getByRole("button", { name: "Sign out" }).first().click();
      await expect(page).toHaveURL(/\/$/, { timeout: 15_000 });
    }).toPass({ timeout: 90_000 });
    expect(await whoAmI(page)).toBeNull();
  });

  test("redirects anonymous visitors from the dashboard to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("signup", () => {
  test("creates an account that can sign in straight away without email delivery", async ({ page }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await page.goto("/signup");
    await page.getByLabel("Name").fill("E2E Learner");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("a-long-enough-password");
    await page.getByRole("button", { name: "Sign up" }).click();

    // Without AUTH_RESEND_KEY the API verifies immediately and the login page confirms it.
    await expect(page).toHaveURL(/\/login\?verified=1/, { timeout: 15_000 });
    await expect(page.getByText(/Email verified/)).toBeVisible();

    await page.getByLabel("Password", { exact: true }).fill("a-long-enough-password");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("reports an email that is already registered", async ({ page }) => {
    await page.goto("/signup");
    await page.getByLabel("Name").fill("Dup");
    await page.getByLabel("Email").fill("mentee1@buildment.dev");
    await page.getByLabel("Password").fill("a-long-enough-password");
    await page.getByRole("button", { name: "Sign up" }).click();
    await expect(page.getByText(/already exists/)).toBeVisible();
  });
});

test("magic link request lands on the check-your-email page", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email for magic link").fill("mentee1@buildment.dev");
  await page.getByRole("button", { name: "Send magic link" }).click();
  await expect(page).toHaveURL(/\/verify$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /check your email/i })).toBeVisible();
});

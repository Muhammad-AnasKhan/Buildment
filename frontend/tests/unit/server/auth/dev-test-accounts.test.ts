import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { devTestAccounts } from "../../../../src/server/auth/dev-test-accounts";
import { SEED_USERS } from "../../../../src/shared/lib/seed-data";

const serverApiFetch = vi.fn();
vi.mock("@/lib/api-server", () => ({ serverApiFetch }));
vi.mock("@/server/auth/session-cookie", () => ({ setSessionCookie: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const { signInAsTestAccountAction } = await import("../../../../src/server/actions/sign-in-credentials");

const initial = { fieldErrors: {}, formError: null };

function pick(email: string) {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

beforeEach(() => serverApiFetch.mockReset());
afterEach(() => vi.unstubAllEnvs());

describe("devTestAccounts", () => {
  it("returns no picker data in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(devTestAccounts()).toBeNull();
  });

  it("lists every seeded user with a role label outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const result = devTestAccounts();
    expect(result?.password).toBe("buildment-dev");
    expect(result?.accounts.map((account) => account.email)).toEqual(SEED_USERS.map((user) => user.email));
    expect(result?.accounts.find((account) => account.email === "mentor@buildment.dev")?.roleLabel).toBe("Mentor");
  });
});

describe("signInAsTestAccountAction", () => {
  it("refuses to sign in in production without calling the API", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const state = await signInAsTestAccountAction(initial, pick("mentor@buildment.dev"));
    expect(state.formError).toMatch(/only available in development/);
    expect(serverApiFetch).not.toHaveBeenCalled();
  });

  it("refuses an email that is not a seeded account", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const state = await signInAsTestAccountAction(initial, pick("someone@example.com"));
    expect(state.formError).toMatch(/only available in development/);
    expect(serverApiFetch).not.toHaveBeenCalled();
  });

  it("signs a seeded user in through the regular login call", async () => {
    vi.stubEnv("NODE_ENV", "development");
    serverApiFetch.mockResolvedValue({ session: { token: "t", expiresAt: new Date().toISOString() } });
    await signInAsTestAccountAction(initial, pick("mentor@buildment.dev"));
    expect(serverApiFetch).toHaveBeenCalledWith("/api/v1/auth/login", {
      method: "POST",
      json: { email: "mentor@buildment.dev", password: "buildment-dev" },
      token: null,
    });
  });
});

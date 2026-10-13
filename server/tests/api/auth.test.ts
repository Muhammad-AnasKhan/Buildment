import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { createCourseFixture } from "../helpers/fixtures.js";

const app = createApp();
let fx: Awaited<ReturnType<typeof createCourseFixture>>;

beforeAll(async () => {
  fx = await createCourseFixture();
});
afterAll(() => fx.cleanup());

describe("GET /api/v1/auth/me", () => {
  it("rejects anonymous requests with the error envelope", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ success: false, message: "Not signed in", code: "AUTH_REQUIRED" });
  });

  it("accepts the session as a bearer token", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${fx.learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({ id: fx.learner.id, email: fx.learner.email, role: "MENTEE" });
  });

  it("accepts the session as the Auth.js cookie", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Cookie", `authjs.session-token=${fx.learnerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(fx.learner.id);
  });

  it("ignores unknown tokens", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer nope");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/v1/auth/dev-login", () => {
  it("refuses non-seed accounts", async () => {
    const res = await request(app).get("/api/v1/auth/dev-login").query({ email: fx.learner.email });
    expect(res.status).toBe(403);
  });

  it("mints a session cookie for a seed account and redirects into the app", async () => {
    const res = await request(app).get("/api/v1/auth/dev-login").query({ email: "mentee1@buildment.dev", redirectTo: "/catalog" });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("http://localhost:3000/catalog");
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^authjs\.session-token=[a-f0-9]{64}; Path=\/;.*HttpOnly/);
  });

  it("falls back to the role home for unsafe redirect targets", async () => {
    const res = await request(app).get("/api/v1/auth/dev-login").query({ email: "mentee1@buildment.dev", redirectTo: "//evil.com" });
    expect(res.headers.location).toBe("http://localhost:3000/dashboard");
  });
});

describe("GET /api/v1/auth/confirm-email", () => {
  it("redirects to login with an error when the token is missing or unknown", async () => {
    const missing = await request(app).get("/api/v1/auth/confirm-email");
    expect(missing.headers.location).toBe("http://localhost:3000/login?error=verify-missing");
    const unknown = await request(app).get("/api/v1/auth/confirm-email").query({ token: "nope" });
    expect(unknown.headers.location).toBe("http://localhost:3000/login?error=verify-invalid");
  });
});

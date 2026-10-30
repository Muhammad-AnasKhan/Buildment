import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/db/prisma.js";
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
    expect(res.headers.location).toBe("/catalog");
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^authjs\.session-token=[a-f0-9]{64}; Path=\/;.*HttpOnly/);
  });

  it("falls back to the role home for unsafe redirect targets", async () => {
    const res = await request(app).get("/api/v1/auth/dev-login").query({ email: "mentee1@buildment.dev", redirectTo: "//evil.com" });
    expect(res.headers.location).toBe("/dashboard");
  });
});

describe("GET /api/v1/auth/confirm-email", () => {
  it("redirects to login with an error when the token is missing or unknown", async () => {
    const missing = await request(app).get("/api/v1/auth/confirm-email");
    expect(missing.headers.location).toBe("/login?error=verify-missing");
    const unknown = await request(app).get("/api/v1/auth/confirm-email").query({ token: "nope" });
    expect(unknown.headers.location).toBe("/login?error=verify-invalid");
  });
});

describe("password accounts", () => {
  const email = `signup-${Date.now()}@test.local`;
  const password = "correct horse battery";
  let token = "";

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.userProfile.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it("signs up, auto-verifying when email delivery is not configured", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({ name: "Sam", email, password });
    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ email, status: "verified" });
  });

  it("rejects a second signup with the same email", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({ name: "Sam", email, password });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("EMAIL_TAKEN");
  });

  it("returns field errors for a weak signup", async () => {
    const res = await request(app).post("/api/v1/auth/signup").send({ name: "", email: "nope", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.errors.map((e: { field: string }) => e.field).sort()).toEqual(["email", "name", "password"]);
  });

  it("rejects wrong passwords without revealing which part failed", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email, password: "wrong" });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("logs in, sets the cookie and returns the session token", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({ email: email.toUpperCase(), password });
    expect(res.status).toBe(200);
    expect(res.body.data.user).toMatchObject({ email, role: "MENTEE" });
    expect(res.body.data.user.emailVerified).toEqual(expect.any(String));
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^authjs\.session-token=/);
    token = res.body.data.session.token;

    const me = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.body.data.user.email).toBe(email);
  });

  it("refuses to resend verification for an already verified account", async () => {
    const res = await request(app).post("/api/v1/auth/resend-verification").set("Authorization", `Bearer ${token}`).send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("ALREADY_VERIFIED");
  });

  it("logs out, clearing the cookie and invalidating the token", async () => {
    const res = await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]?.[0]).toMatch(/^authjs\.session-token=;/);
    const me = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(401);
  });
});

describe("magic links", () => {
  const email = `magic-${Date.now()}@test.local`;

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.userProfile.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it("does not issue a link for unknown emails and stores one for an existing account", async () => {
    const unknown = await request(app).post("/api/v1/auth/magic-link").send({ email, redirectTo: "/catalog" });
    expect(unknown.status).toBe(200);
    expect(await prisma.verificationToken.findFirst({ where: { identifier: `magic-link:${email}` } })).toBeNull();

    await prisma.user.create({
      data: { email, name: "Magic Link Learner", role: "MENTEE", profile: { create: { timezone: "UTC", skills: [] } } },
    });
    const res = await request(app).post("/api/v1/auth/magic-link").send({ email, redirectTo: "/catalog" });
    expect(res.status).toBe(200);
    const row = await prisma.verificationToken.findFirst({ where: { identifier: `magic-link:${email}` } });
    expect(row).not.toBeNull();
  });

  it("signs in the existing account and consumes the token", async () => {
    const row = await prisma.verificationToken.findFirstOrThrow({ where: { identifier: `magic-link:${email}` } });
    const res = await request(app).get("/api/v1/auth/magic-link/verify").query({ token: row.token, redirectTo: "/catalog" });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/catalog");
    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/^authjs\.session-token=[a-f0-9]{64}/);

    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.emailVerified).toBeInstanceOf(Date);

    const again = await request(app).get("/api/v1/auth/magic-link/verify").query({ token: row.token });
    expect(again.headers.location).toBe("/login?error=magic-invalid");
  });

  it("does not accept email-confirmation tokens as sign-in links", async () => {
    await prisma.verificationToken.create({ data: { identifier: email, token: `confirm-${email}`, expires: new Date(Date.now() + 60_000) } });
    const res = await request(app).get("/api/v1/auth/magic-link/verify").query({ token: `confirm-${email}` });
    expect(res.headers.location).toBe("/login?error=magic-invalid");
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  });
});

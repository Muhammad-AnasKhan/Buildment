import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as SessionModule from "../../../../src/services/auth/session.js";

vi.mock("../../../../src/services/auth/change-password.js", () => ({ changePassword: vi.fn() }));
vi.mock("../../../../src/services/auth/session.js", async (importOriginal) => ({
  ...await importOriginal<typeof SessionModule>(),
  findSessionUser: vi.fn(),
}));

import authRouter from "../../../../src/routes/v1/auth.js";
import { errorHandler } from "../../../../src/middlewares/error-handler.js";
import { changePassword } from "../../../../src/services/auth/change-password.js";
import { findSessionUser } from "../../../../src/services/auth/session.js";

const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use(errorHandler);
const body = { currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" };

beforeEach(() => vi.resetAllMocks());

describe("password changes for signed-in users", () => {
  it("rejects anonymous requests", async () => {
    expect((await request(app).patch("/auth/password").send(body)).status).toBe(401);
    expect(changePassword).not.toHaveBeenCalled();
  });

  it.each(["MENTEE", "MENTOR"] as const)("allows %s to change only their own password", async (role) => {
    vi.mocked(findSessionUser).mockResolvedValue({ id: `self-${role}`, role, email: "user@test.local", name: "User", image: null, emailVerified: new Date() });
    const response = await request(app).patch("/auth/password").set("Authorization", "Bearer own-session").send({ ...body, userId: "someone-else" });
    expect(response.status).toBe(204);
    expect(changePassword).toHaveBeenCalledWith(`self-${role}`, "own-session", body);
  });

  it("rejects mismatched confirmation before calling the service", async () => {
    vi.mocked(findSessionUser).mockResolvedValue({ id: "mismatch", role: "MENTEE", email: "user@test.local", name: "User", image: null, emailVerified: new Date() });
    const response = await request(app).patch("/auth/password").set("Authorization", "Bearer own-session").send({ ...body, confirmPassword: "different" });
    expect(response.status).toBe(400);
    expect(changePassword).not.toHaveBeenCalled();
  });
});

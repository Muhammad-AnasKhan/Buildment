import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword, verifyPassword } from "../../../../src/services/auth/password.js";
import { adminPasswordBody, adminProfileBody } from "../../../../src/validations/admin.js";

const db = vi.hoisted(() => ({
  user: { findUniqueOrThrow: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  session: { deleteMany: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock("../../../../src/db/prisma.js", () => ({ prisma: db }));
import { updateAdminPassword, updateAdminProfile } from "../../../../src/services/admin/profile.js";

beforeEach(() => {
  vi.resetAllMocks();
  db.user.findUniqueOrThrow.mockResolvedValue({ email: "admin@test.local", passwordHash: hashPassword("old-password") });
});

describe("admin account settings", () => {
  it("allows a name-only update without a password", async () => {
    await updateAdminProfile("self", { name: "Updated", email: "admin@test.local" });
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "self" }, data: { name: "Updated", email: "admin@test.local" } });
  });

  it("requires the current password to change email", async () => {
    await expect(updateAdminProfile("self", { name: "Admin", email: "new@test.local", currentPassword: "wrong" })).rejects.toMatchObject({ code: "INVALID_PASSWORD" });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("rejects an email belonging to another account", async () => {
    db.user.findUnique.mockResolvedValue({ id: "other" });
    await expect(updateAdminProfile("self", { name: "Admin", email: "taken@test.local", currentPassword: "old-password" })).rejects.toMatchObject({ code: "EMAIL_IN_USE" });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("normalizes email and clears verification when changing it", async () => {
    const input = adminProfileBody.parse({ name: "Admin", email: " NEW@Test.local ", currentPassword: "old-password", role: "ADMIN" });
    await updateAdminProfile("self", input);
    expect(db.user.update).toHaveBeenCalledWith({ where: { id: "self" }, data: { name: "Admin", email: "new@test.local", emailVerified: null } });
  });

  it("rejects incorrect passwords without revoking sessions", async () => {
    await expect(updateAdminPassword("self", "current-session", { currentPassword: "wrong", newPassword: "new-password" })).rejects.toMatchObject({ code: "INVALID_PASSWORD" });
    expect(db.session.deleteMany).not.toHaveBeenCalled();
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("hashes the new password and revokes only other sessions in a transaction", async () => {
    await updateAdminPassword("self", "current-session", { currentPassword: "old-password", newPassword: "new-password" });
    const saved = db.user.update.mock.calls[0][0];
    expect(saved.where).toEqual({ id: "self" });
    expect(verifyPassword("new-password", saved.data.passwordHash)).toBe(true);
    expect(db.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "self", sessionToken: { not: "current-session" } } });
    expect(db.$transaction).toHaveBeenCalledOnce();
  });

  it("does not allow passwordless accounts to bypass reauthentication", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ email: "admin@test.local", passwordHash: null });
    await expect(updateAdminPassword("self", "session", { currentPassword: "anything", newPassword: "new-password" })).rejects.toMatchObject({ code: "PASSWORD_NOT_SET" });
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it("rejects short and mismatched new passwords", () => {
    expect(adminPasswordBody.safeParse({ currentPassword: "old", newPassword: "short", confirmPassword: "short" }).success).toBe(false);
    expect(adminPasswordBody.safeParse({ currentPassword: "old", newPassword: "new-password", confirmPassword: "different" }).success).toBe(false);
  });
});

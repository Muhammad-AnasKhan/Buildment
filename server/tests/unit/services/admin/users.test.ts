import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  instructorAccessRequest: { findUnique: vi.fn(), update: vi.fn(), upsert: vi.fn() },
  adminAuditLog: { create: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock("../../../../src/db/prisma.js", () => ({ prisma: db }));
vi.mock("../../../../src/services/notifications/events.js", () => ({
  notifyUserGrantedAdminByAdmin: vi.fn(),
  notifyUserGrantedInstructorByAdmin: vi.fn(),
  notifyUserInstructorAccessDecision: vi.fn(),
}));

import { approveInstructorRequest, setInstructorAccess } from "../../../../src/services/admin/users.js";
import { canAccessTeachSurface } from "../../../../src/services/auth/access-rules.js";

const admin = { id: "admin", email: "admin@test.local" };

beforeEach(() => {
  vi.resetAllMocks();
  db.$transaction.mockImplementation(async (work) =>
    typeof work === "function" ? work(db) : Promise.all(work));
});

describe("mentor role changes", () => {
  it("promotes a mentee when an admin approves a pending request", async () => {
    db.instructorAccessRequest.findUnique.mockResolvedValue({
      id: "request", userId: "learner", status: "PENDING", user: { role: "MENTEE", email: "learner@test.local" },
    });
    await approveInstructorRequest(admin, "request");
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "learner" }, data: { role: "MENTOR" },
    });
    expect(db.instructorAccessRequest.update).toHaveBeenCalledWith({
      where: { id: "request" },
      data: { status: "APPROVED", reviewedById: "admin", reviewedAt: expect.any(Date) },
    });
    expect(db.adminAuditLog.create).toHaveBeenCalledOnce();
  });

  it("revokes teaching access by returning a mentor to the mentee role", async () => {
    db.user.findUnique.mockResolvedValue({ role: "MENTOR", email: "mentor@test.local" });
    await setInstructorAccess(admin, "mentor", false);
    const update = db.user.update.mock.calls[0][0];
    expect(update.data).toEqual({ role: "MENTEE" });
    expect(canAccessTeachSurface(update.data)).toBe(false);
  });

  it("preserves an admin's role and access", async () => {
    db.user.findUnique.mockResolvedValue({ role: "ADMIN", email: "admin@test.local" });
    await setInstructorAccess(admin, "admin", false);
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: "admin" }, data: { role: "ADMIN" },
    });
  });

  it("does not promote a user from a rejected request", async () => {
    db.instructorAccessRequest.findUnique.mockResolvedValue({
      id: "request", userId: "learner", status: "REJECTED", user: { role: "MENTEE", email: "learner@test.local" },
    });
    await expect(approveInstructorRequest(admin, "request")).rejects.toThrow();
    expect(db.user.update).not.toHaveBeenCalled();
  });
});

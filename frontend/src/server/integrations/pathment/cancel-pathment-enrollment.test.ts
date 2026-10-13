import { describe, expect, it, vi, beforeEach } from "vitest";
import { cancelPathmentEnrollment } from "./cancel-pathment-enrollment";
import { PathmentEnrollmentError } from "./create-pathment-enrollment";

const orgAuth = { organizationId: "org-1", slug: "acme" };

const baseEnrollment = {
  id: "enr-1",
  courseId: "course-1",
  userId: null as string | null,
  organizationId: "org-1",
  lifecycle: "ACTIVE" as const,
  status: "IN_PROGRESS" as const,
  source: "PATHMENT" as const,
  externalMentorId: "mentor-ext-1",
  externalAssignmentId: "assign-1",
  learnerProfile: { email: "learner@example.com", userId: null },
  user: null,
  course: { id: "course-1", title: "Test Course" },
  percentComplete: 0,
  createdAt: new Date(),
};

function mockDb(overrides: {
  enrollment?: typeof baseEnrollment | null;
  allocation?: { id: string } | null;
  updateResult?: typeof baseEnrollment;
}) {
  const tx = {
    enrollment: {
      update: vi.fn().mockResolvedValue(
        overrides.updateResult ?? {
          ...baseEnrollment,
          lifecycle: "CANCELLED",
          status: "DROPPED",
        }
      ),
    },
    $executeRaw: vi.fn().mockResolvedValue(1),
  };
  return {
    enrollment: {
      findFirst: vi.fn().mockResolvedValue(overrides.enrollment ?? null),
    },
    organizationCourse: {
      findUnique: vi.fn().mockResolvedValue(overrides.allocation ?? { id: "alloc-1" }),
    },
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
    _tx: tx,
  };
}

describe("cancelPathmentEnrollment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects org_slug mismatch", async () => {
    const db = mockDb({ enrollment: baseEnrollment });
    await expect(
      cancelPathmentEnrollment(db as never, orgAuth, {
        organizationId: "org-1",
        orgSlug: "wrong-slug",
        courseId: "course-1",
        email: "learner@example.com",
      })
    ).rejects.toMatchObject({ status: 403 });
  });

  it("cancels an active enrollment and releases a slot", async () => {
    const db = mockDb({ enrollment: baseEnrollment });
    const result = await cancelPathmentEnrollment(db as never, orgAuth, {
      organizationId: "org-1",
      orgSlug: "acme",
      courseId: "course-1",
      email: "learner@example.com",
      mentorId: "mentor-ext-1",
    });
    expect(result.cancelled).toBe(true);
    expect(result.enrollment.lifecycle).toBe("CANCELLED");
    expect(db._tx.$executeRaw).toHaveBeenCalled();
  });

  it("is idempotent when already cancelled", async () => {
    const db = mockDb({
      enrollment: {
        ...baseEnrollment,
        lifecycle: "CANCELLED" as const,
        status: "DROPPED" as const,
      },
    });
    const result = await cancelPathmentEnrollment(db as never, orgAuth, {
      organizationId: "org-1",
      orgSlug: "acme",
      courseId: "course-1",
      email: "learner@example.com",
    });
    expect(result.alreadyCancelled).toBe(true);
    expect(result.cancelled).toBe(false);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("returns 404 when no enrollment", async () => {
    const db = mockDb({ enrollment: null });
    await expect(
      cancelPathmentEnrollment(db as never, orgAuth, {
        organizationId: "org-1",
        orgSlug: "acme",
        courseId: "course-1",
        email: "learner@example.com",
      })
    ).rejects.toBeInstanceOf(PathmentEnrollmentError);
  });
});

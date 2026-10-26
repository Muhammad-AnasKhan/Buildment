import "dotenv/config";
import { hashIntegrationSecret } from "../src/services/integrations/credential-hash.js";
import { generateTotpSecret } from "../src/services/auth/totp.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

// Local-only scale data so paging, search, CSV export, and the trend charts can be
// checked against real volume: 100 organizations, 100 course requests, 100 courses,
// 100 users — plus 100 enrollments and 14 days of study activity so the metrics
// charts are not flat. Every row uses the `scale-` prefix, so `--clean` removes it.
//
//   pnpm --dir server db:seed:scale
//   pnpm --dir server db:seed:scale -- --clean
//
// These accounts have no password: they exist to be browsed, not signed into.

const PREFIX = "scale";
const USER_COUNT = 100;
const COURSE_COUNT = 100;
const ORG_COUNT = 100;
const REQUEST_COUNT = 100;
const ENROLLMENT_COUNT = 100;
const ACTIVITY_DAYS = 14;

const MENTOR_USERS = 25;
const UNVERIFIED_USERS = 5;
const SUSPENDED_USERS = 3;
const MFA_USERS = 2;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Deterministic PRNG so repeat runs look the same (ids still differ). */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(3, "0");
const dayStart = (offsetDays: number) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - offsetDays);
  return date;
};

async function clean() {
  const organizations = await prisma.organization.findMany({
    where: { slug: { startsWith: `${PREFIX}-org-` } },
    select: { id: true },
  });
  const organizationIds = organizations.map((org) => org.id);

  const requests = await prisma.organizationCourseRequest.deleteMany({ where: { organizationId: { in: organizationIds } } });
  const credentials = await prisma.organizationApiCredential.deleteMany({ where: { organizationId: { in: organizationIds } } });
  const allocations = await prisma.organizationCourse.deleteMany({ where: { organizationId: { in: organizationIds } } });

  const courses = await prisma.course.findMany({
    where: { slug: { startsWith: `${PREFIX}-course-` } },
    select: { id: true },
  });
  const courseIds = courses.map((course) => course.id);
  // Enrollments cascade to their DailyActivity rows.
  const enrollments = await prisma.enrollment.deleteMany({ where: { courseId: { in: courseIds } } });
  const deletedCourses = await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
  const users = await prisma.user.deleteMany({ where: { email: { startsWith: `${PREFIX}-user-` } } });
  const organizationsDeleted = await prisma.organization.deleteMany({ where: { id: { in: organizationIds } } });

  console.log("Removed scale data:", {
    requests: requests.count,
    credentials: credentials.count,
    allocations: allocations.count,
    enrollments: enrollments.count,
    courses: deletedCourses.count,
    users: users.count,
    organizations: organizationsDeleted.count,
  });
}

async function seed() {
  const random = makeRandom(20261026);
  const secret = hashIntegrationSecret("scale-seed-secret");

  const result = await prisma.$transaction(
    async (tx) => {
      const userIds: Array<{ id: string; role: "MENTEE" | "MENTOR" }> = [];
      const mentorIds: string[] = [];
      const menteeIds: string[] = [];

      for (let n = 1; n <= USER_COUNT; n += 1) {
        const isMentor = n <= MENTOR_USERS;
        const suspended = !isMentor && n > USER_COUNT - SUSPENDED_USERS;
        const unverified = !isMentor && !suspended && n > USER_COUNT - SUSPENDED_USERS - UNVERIFIED_USERS;
        const withMfa = isMentor && n <= MFA_USERS;
        const role = isMentor ? "MENTOR" : "MENTEE";

        const user = await tx.user.create({
          data: {
            email: `${PREFIX}-user-${pad(n)}@test.local`,
            name: `${isMentor ? "Scale Mentor" : "Scale Learner"} ${pad(n)}`,
            role,
            emailVerified: unverified ? null : new Date(),
            suspendedAt: suspended ? dayStart(2) : null,
            suspensionNote: suspended ? "Seed data: suspended example" : null,
            zipImportEnabled: isMentor && n % 4 === 0,
            ...(withMfa ? { totpSecret: generateTotpSecret(), totpEnabledAt: new Date() } : {}),
            profile: { create: { timezone: "UTC", skills: [] } },
          },
          select: { id: true },
        });
        userIds.push({ id: user.id, role });
        if (isMentor) mentorIds.push(user.id);
        else menteeIds.push(user.id);
      }

      const courseIds: string[] = [];
      const publishedCourseIds: string[] = [];
      for (let n = 1; n <= COURSE_COUNT; n += 1) {
        const status = n <= 80 ? "PUBLISHED" : n <= 95 ? "DRAFT" : "ARCHIVED";
        const paid = n % 3 === 0;
        const course = await tx.course.create({
          data: {
            slug: `${PREFIX}-course-${pad(n)}`,
            title: `Scale Course ${pad(n)} — Operations`,
            description: `Seed course ${pad(n)} used to check paging, filters, and CSV export.`,
            status,
            mentorId: mentorIds[n % mentorIds.length]!,
            pricingType: paid ? "PAID" : "FREE",
            priceCents: paid ? 2500 + n * 100 : 0,
            currency: "USD",
            difficulty: n % 2 === 0 ? "Intermediate" : "Beginner",
            estimatedHours: 6 + (n % 12),
            sequential: n % 5 === 0,
            publishedAt: status === "DRAFT" ? null : dayStart(n % 30),
          },
          select: { id: true },
        });
        courseIds.push(course.id);
        if (status === "PUBLISHED") publishedCourseIds.push(course.id);
      }

      const organizationIds: string[] = [];
      for (let n = 1; n <= ORG_COUNT; n += 1) {
        const organization = await tx.organization.create({
          data: { slug: `${PREFIX}-org-${pad(n)}`, name: `Scale Org ${pad(n)}` },
          select: { id: true },
        });
        organizationIds.push(organization.id);
      }

      await tx.organizationApiCredential.createMany({
        data: organizationIds.map((organizationId, index) => ({
          organizationId,
          accessKey: `org_scale_${pad(index + 1)}${hashIntegrationSecret(String(index)).slice(0, 8)}`,
          secretHash: secret,
          label: "default",
          active: true,
        })),
      });

      const requestRows = Array.from({ length: REQUEST_COUNT }, (_, index) => {
        const status = index < 60 ? "PENDING" : index < 85 ? "APPROVED" : "REJECTED";
        const reviewed = status !== "PENDING";
        return {
          organizationId: organizationIds[index % organizationIds.length]!,
          courseId: publishedCourseIds[index % publishedCourseIds.length]!,
          status: status as "PENDING" | "APPROVED" | "REJECTED",
          requestedAt: dayStart(index % 30),
          reviewedAt: reviewed ? dayStart(index % 20) : null,
          reviewedById: reviewed ? mentorIds[index % mentorIds.length]! : null,
        };
      });
      await tx.organizationCourseRequest.createMany({ data: requestRows });

      const enrollmentRows = Array.from({ length: ENROLLMENT_COUNT }, (_, index) => ({
        courseId: publishedCourseIds[index % publishedCourseIds.length]!,
        userId: menteeIds[index % menteeIds.length]!,
        source: "DIRECT" as const,
        lifecycle: "ACTIVE" as const,
        status: "ASSIGNED" as const,
        percentComplete: (index * 7) % 100,
        chaptersCompleted: index % 6,
        createdAt: dayStart(index % 28),
        startedAt: dayStart(index % 28),
        lastActiveAt: dayStart(index % 3),
      }));
      await tx.enrollment.createMany({ data: enrollmentRows });
      const enrollments = await tx.enrollment.findMany({
        where: { courseId: { in: publishedCourseIds } },
        select: { id: true },
      });

      const activityRows = enrollments.flatMap((enrollment, enrollmentIndex) =>
        Array.from({ length: ACTIVITY_DAYS }, (_, offset) => ({
          enrollmentId: enrollment.id,
          date: dayStart(offset),
          activeSeconds: Math.floor(random() * 5400),
        })).filter((_, dayIndex) => (dayIndex + enrollmentIndex) % 3 !== 0)
      );
      await tx.dailyActivity.createMany({ data: activityRows });

      return {
        users: userIds.length,
        courses: courseIds.length,
        organizations: organizationIds.length,
        requests: requestRows.length,
        enrollments: enrollmentRows.length,
        activityRows: activityRows.length,
      };
    },
    { timeout: 120_000 }
  );

  console.log("Seeded scale data:", result);
  console.log("Check: /admin/users, /admin/courses, /admin/organizations, /admin/requests, /admin (trends)");
  console.log(`Remove it: pnpm --dir server db:seed:scale -- --clean`);
}

async function main() {
  if (process.argv.includes("--clean")) await clean();
  else await seed();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

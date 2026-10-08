import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COURSE, SEED_USERS } from "../src/lib/seed-data";
import { SEED_DEV_PASSWORD } from "../src/lib/seed-test-users";
import { hashPassword } from "../src/server/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const mentorSeed = SEED_USERS.find((u) => u.role === "MENTOR");
  const menteeSeeds = SEED_USERS.filter((u) => u.role === "MENTEE");
  if (!mentorSeed) throw new Error("SEED_USERS must include exactly one MENTOR");

  const passwordHash = hashPassword(SEED_DEV_PASSWORD);
  await Promise.all(
    SEED_USERS.map((seed) => {
      const data = {
        emailVerified: new Date(),
        passwordHash,
        role: seed.role,
        ...(seed.role === "MENTOR" ? { canInstruct: true } : {}),
      };
      return prisma.user.upsert({
        where: { email: seed.email },
        update: data,
        create: { email: seed.email, name: seed.name, ...data },
      });
    })
  );

  const mentor = await prisma.user.findUniqueOrThrow({ where: { email: mentorSeed.email } });
  const mentees = await Promise.all(
    menteeSeeds.map((seed) => prisma.user.findUniqueOrThrow({ where: { email: seed.email } }))
  );

  const course = await prisma.course.upsert({
    where: { slug: SEED_COURSE.slug },
    update: { sequential: true, status: "PUBLISHED", publishedAt: new Date() },
    create: {
      slug: SEED_COURSE.slug,
      title: SEED_COURSE.title,
      description: SEED_COURSE.description,
      projectGoal: SEED_COURSE.projectGoal,
      difficulty: SEED_COURSE.difficulty,
      estimatedHours: SEED_COURSE.estimatedHours,
      status: "PUBLISHED",
      sequential: true,
      mentorId: mentor.id,
      publishedAt: new Date(),
    },
  });

  const enrollments = [mentor, ...mentees];
  await Promise.all(
    enrollments.map((user) =>
      prisma.enrollment.upsert({
        where: { courseId_userId: { courseId: course.id, userId: user.id } },
        update: {},
        create: { courseId: course.id, userId: user.id, status: "ASSIGNED" },
      })
    )
  );

  const admin = await prisma.user.findUnique({ where: { email: "admin@buildment.dev" } });

  console.log("Seeded:");
  if (admin) console.log(`  admin:   ${admin.email}`);
  console.log(`  mentor:  ${mentor.email}`);
  mentees.forEach((m) => console.log(`  mentee:  ${m.email}`));
  console.log(`  course:  ${course.slug} (${enrollments.length} enrollments, mentor included for dev preview)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

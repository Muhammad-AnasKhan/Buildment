import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COURSE, SEED_USERS } from "../src/lib/seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const mentorSeed = SEED_USERS.find((u) => u.role === "MENTOR");
  const menteeSeeds = SEED_USERS.filter((u) => u.role === "MENTEE");
  if (!mentorSeed) throw new Error("SEED_USERS must include exactly one MENTOR");

  const mentor = await prisma.user.upsert({
    where: { email: mentorSeed.email },
    update: {},
    create: { email: mentorSeed.email, name: mentorSeed.name, role: "MENTOR" },
  });

  const mentees = await Promise.all(
    menteeSeeds.map((seed) =>
      prisma.user.upsert({
        where: { email: seed.email },
        update: {},
        create: { email: seed.email, name: seed.name, role: "MENTEE" },
      })
    )
  );

  const course = await prisma.course.upsert({
    where: { slug: SEED_COURSE.slug },
    update: {},
    create: {
      slug: SEED_COURSE.slug,
      title: SEED_COURSE.title,
      description: SEED_COURSE.description,
      projectGoal: SEED_COURSE.projectGoal,
      difficulty: SEED_COURSE.difficulty,
      estimatedHours: SEED_COURSE.estimatedHours,
      status: "PUBLISHED",
      mentorId: mentor.id,
      publishedAt: new Date(),
    },
  });

  await Promise.all(
    mentees.map((mentee) =>
      prisma.enrollment.upsert({
        where: { courseId_userId: { courseId: course.id, userId: mentee.id } },
        update: {},
        create: { courseId: course.id, userId: mentee.id, status: "ASSIGNED" },
      })
    )
  );

  console.log("Seeded:");
  console.log(`  mentor:  ${mentor.email}`);
  mentees.forEach((m) => console.log(`  mentee:  ${m.email}`));
  console.log(`  course:  ${course.slug} (${mentees.length} enrollments)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

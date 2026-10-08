/**
 * Seeds a demo organization with API credentials and a course allocation for local Pathment testing.
 *
 * Usage: pnpm exec tsx scripts/seed-integration-demo.ts
 *
 * Prints access key + secret once. Re-running rotates credentials if org already exists.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_COURSE } from "../src/lib/seed-data";
import {
  generateAccessKey,
  generateSecretKey,
  hashSecret,
} from "../src/server/admin/credentials";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ORG_SLUG = "pathment-demo";

async function main() {
  const course = await prisma.course.findUnique({ where: { slug: SEED_COURSE.slug } });
  if (!course) {
    throw new Error(`Seed course ${SEED_COURSE.slug} not found — run pnpm db:seed first`);
  }

  const org = await prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    create: { slug: ORG_SLUG, name: "Pathment Demo Org" },
    update: {},
  });

  await prisma.organizationApiCredential.updateMany({
    where: { organizationId: org.id, active: true },
    data: { active: false },
  });

  const accessKey = generateAccessKey();
  const secret = generateSecretKey();
  await prisma.organizationApiCredential.create({
    data: {
      organizationId: org.id,
      accessKey,
      secretHash: hashSecret(secret),
      label: "demo",
    },
  });

  await prisma.organizationCourse.upsert({
    where: {
      organizationId_courseId: { organizationId: org.id, courseId: course.id },
    },
    create: {
      organizationId: org.id,
      courseId: course.id,
      maxEnrollments: 500,
      isAllowed: true,
    },
    update: { isAllowed: true, maxEnrollments: 500 },
  });

  console.log("Integration demo org ready:");
  console.log(`  organization: ${org.slug} (${org.id})`);
  console.log(`  course:       ${course.slug}`);
  console.log(`  access key:   ${accessKey}`);
  console.log(`  secret key:   ${secret}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

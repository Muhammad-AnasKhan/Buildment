-- CreateEnum
CREATE TYPE "EnrollmentLifecycle" AS ENUM ('PENDING_ACCOUNT', 'PAYMENT_REQUIRED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "EnrollmentSource" AS ENUM ('DIRECT', 'INVITE', 'SELF', 'PATHMENT');
CREATE TYPE "CoursePricingType" AS ENUM ('FREE', 'PAID');
CREATE TYPE "OrganizationCourseRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "canInstruct" BOOLEAN NOT NULL DEFAULT false;
UPDATE "User" SET "canInstruct" = true WHERE "role" IN ('MENTOR', 'ADMIN');

-- CreateTable UserProfile
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable LearnerProfile
CREATE TABLE "LearnerProfile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "linkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable Organization
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrganizationApiCredential
CREATE TABLE "OrganizationApiCredential" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accessKey" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'default',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),

    CONSTRAINT "OrganizationApiCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrganizationCourse
CREATE TABLE "OrganizationCourse" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "maxEnrollments" INTEGER NOT NULL,
    "currentEnrollments" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrganizationCourseRequest
CREATE TABLE "OrganizationCourseRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "OrganizationCourseRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,

    CONSTRAINT "OrganizationCourseRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable Payment
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT,
    "providerRef" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AlterTable Course
ALTER TABLE "Course" ADD COLUMN "pricingType" "CoursePricingType" NOT NULL DEFAULT 'FREE';
ALTER TABLE "Course" ADD COLUMN "priceCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Course" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable Enrollment
ALTER TABLE "Enrollment" ADD COLUMN "learnerProfileId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "lifecycle" "EnrollmentLifecycle" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Enrollment" ADD COLUMN "source" "EnrollmentSource" NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "Enrollment" ADD COLUMN "externalMentorId" TEXT;
ALTER TABLE "Enrollment" ADD COLUMN "externalAssignmentId" TEXT;
ALTER TABLE "Enrollment" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LearnerProfile_email_key" ON "LearnerProfile"("email");
CREATE UNIQUE INDEX "LearnerProfile_userId_key" ON "LearnerProfile"("userId");
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");
CREATE UNIQUE INDEX "OrganizationApiCredential_accessKey_key" ON "OrganizationApiCredential"("accessKey");
CREATE INDEX "OrganizationApiCredential_organizationId_idx" ON "OrganizationApiCredential"("organizationId");
CREATE UNIQUE INDEX "OrganizationCourse_organizationId_courseId_key" ON "OrganizationCourse"("organizationId", "courseId");
CREATE INDEX "OrganizationCourse_courseId_idx" ON "OrganizationCourse"("courseId");
CREATE INDEX "OrganizationCourseRequest_organizationId_status_idx" ON "OrganizationCourseRequest"("organizationId", "status");
CREATE INDEX "OrganizationCourseRequest_courseId_idx" ON "OrganizationCourseRequest"("courseId");
CREATE UNIQUE INDEX "Payment_enrollmentId_key" ON "Payment"("enrollmentId");
CREATE UNIQUE INDEX "Enrollment_courseId_learnerProfileId_key" ON "Enrollment"("courseId", "learnerProfileId");
CREATE UNIQUE INDEX "Enrollment_organizationId_source_externalAssignmentId_key" ON "Enrollment"("organizationId", "source", "externalAssignmentId");
CREATE INDEX "Enrollment_learnerProfileId_idx" ON "Enrollment"("learnerProfileId");
CREATE INDEX "Enrollment_organizationId_courseId_idx" ON "Enrollment"("organizationId", "courseId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LearnerProfile" ADD CONSTRAINT "LearnerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrganizationApiCredential" ADD CONSTRAINT "OrganizationApiCredential_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationCourse" ADD CONSTRAINT "OrganizationCourse_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationCourse" ADD CONSTRAINT "OrganizationCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationCourseRequest" ADD CONSTRAINT "OrganizationCourseRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationCourseRequest" ADD CONSTRAINT "OrganizationCourseRequest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrganizationCourseRequest" ADD CONSTRAINT "OrganizationCourseRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_learnerProfileId_fkey" FOREIGN KEY ("learnerProfileId") REFERENCES "LearnerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

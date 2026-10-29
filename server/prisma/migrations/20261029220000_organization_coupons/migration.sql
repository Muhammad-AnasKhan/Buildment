-- CreateEnum
CREATE TYPE "CouponUsageStatus" AS ENUM ('ISSUED', 'REDEEMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "OrganizationCouponPool" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "courseId" TEXT,
    "label" TEXT NOT NULL,
    "code" TEXT,
    "percentOff" INTEGER NOT NULL DEFAULT 100,
    "maxRedemptions" INTEGER NOT NULL,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationCouponPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouponUsage" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentId" TEXT,
    "userId" TEXT,
    "learnerEmail" TEXT,
    "status" "CouponUsageStatus" NOT NULL DEFAULT 'ISSUED',
    "percentOff" INTEGER NOT NULL,
    "displayLabel" TEXT NOT NULL,
    "assignedById" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganizationCouponPool_organizationId_courseId_active_idx" ON "OrganizationCouponPool"("organizationId", "courseId", "active");

-- CreateIndex
CREATE INDEX "OrganizationCouponPool_organizationId_code_idx" ON "OrganizationCouponPool"("organizationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CouponUsage_enrollmentId_key" ON "CouponUsage"("enrollmentId");

-- CreateIndex
CREATE INDEX "CouponUsage_organizationId_courseId_status_idx" ON "CouponUsage"("organizationId", "courseId", "status");

-- CreateIndex
CREATE INDEX "CouponUsage_learnerEmail_courseId_idx" ON "CouponUsage"("learnerEmail", "courseId");

-- CreateIndex
CREATE INDEX "CouponUsage_userId_courseId_idx" ON "CouponUsage"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "OrganizationCouponPool" ADD CONSTRAINT "OrganizationCouponPool_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationCouponPool" ADD CONSTRAINT "OrganizationCouponPool_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "OrganizationCouponPool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

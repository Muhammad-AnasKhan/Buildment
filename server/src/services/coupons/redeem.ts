import { prisma } from "../../db/prisma.js";

export type CourseCouponEntitlement = {
  displayLabel: string;
  percentOff: number;
  status: "ISSUED" | "REDEEMED";
  organizationName: string;
};

/** Mark the enrollment's coupon as redeemed on first course open, and return the banner payload. */
export async function redeemCouponOnCourseOpen(enrollmentId: string): Promise<CourseCouponEntitlement | null> {
  const usage = await prisma.couponUsage.findUnique({
    where: { enrollmentId },
    include: { organization: { select: { name: true } } },
  });
  if (!usage || usage.status === "CANCELLED") return null;

  if (usage.status === "ISSUED") {
    await prisma.couponUsage.update({
      where: { id: usage.id },
      data: { status: "REDEEMED", redeemedAt: new Date() },
    });
  }

  return {
    displayLabel: usage.displayLabel,
    percentOff: usage.percentOff,
    status: "REDEEMED",
    organizationName: usage.organization.name,
  };
}

export async function getCouponEntitlement(enrollmentId: string): Promise<CourseCouponEntitlement | null> {
  const usage = await prisma.couponUsage.findUnique({
    where: { enrollmentId },
    include: { organization: { select: { name: true } } },
  });
  if (!usage || usage.status === "CANCELLED") return null;
  return {
    displayLabel: usage.displayLabel,
    percentOff: usage.percentOff,
    status: usage.status === "REDEEMED" ? "REDEEMED" : "ISSUED",
    organizationName: usage.organization.name,
  };
}

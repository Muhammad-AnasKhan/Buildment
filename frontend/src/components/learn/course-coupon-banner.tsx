import { BadgePercent } from "lucide-react";
import type { CourseCouponEntitlement } from "@/shared/api/catalog";

/** Shows the org coupon that unlocked or discounted this course for the learner. */
export function CourseCouponBanner({ coupon }: { coupon: CourseCouponEntitlement }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3.5 sm:px-5">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
        <BadgePercent className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{coupon.displayLabel}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Access through {coupon.organizationName}
          {coupon.percentOff >= 100 ? " — no payment needed for this enrollment." : "."}
        </p>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LearnAccessDenied({
  courseSlug,
  reason,
}: {
  courseSlug: string;
  reason: "not_enrolled" | "payment_required" | "pending_account" | "inactive" | "unknown";
}) {
  const copy =
    reason === "payment_required"
      ? {
          title: "Payment required",
          body: "Complete checkout to open chapters and submit checkpoints.",
          href: `/courses/${courseSlug}/checkout`,
          cta: "Go to checkout",
        }
      : reason === "not_enrolled"
        ? {
            title: "You don't have access to this course",
            body: "Enroll from the catalog or use an invite link from your instructor.",
            href: `/catalog/${courseSlug}`,
            cta: "View in catalog",
          }
        : reason === "pending_account"
          ? {
              title: "Finish linking your account",
              body: "This course was assigned before you signed in. Confirm your email and profile, then try again.",
              href: "/settings/profile",
              cta: "Account settings",
            }
          : {
              title: "Course access unavailable",
              body: "This enrollment is not active. Contact support if this looks wrong.",
              href: "/my-courses",
              cta: "My courses",
            };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mt-16 flex flex-col items-center text-center">
        <Lock className="size-8 text-neutral-300" aria-hidden />
        <p className="mt-3 text-sm font-medium text-neutral-700">{copy.title}</p>
        <p className="mt-1 max-w-sm text-sm text-neutral-400">{copy.body}</p>
        <Link href={copy.href} className={cn(buttonVariants(), "mt-6")}>
          {copy.cta}
        </Link>
      </div>
    </div>
  );
}

export function forbiddenToLearnReason(message: string) {
  if (message.includes("payment_required")) return "payment_required" as const;
  if (message.includes("not_enrolled")) return "not_enrolled" as const;
  if (message.includes("pending_account")) return "pending_account" as const;
  if (message.includes("inactive")) return "inactive" as const;
  return "unknown" as const;
}

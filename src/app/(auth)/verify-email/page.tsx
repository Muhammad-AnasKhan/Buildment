import Link from "next/link";
import { redirect } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import { getSessionUser } from "@/server/auth/guards";
import { homeRouteForRole } from "@/server/auth/access-rules";
import { resolveEmailVerifiedForUser } from "@/server/auth/email-verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string }>;
}) {
  const { signup } = await searchParams;
  const user = await getSessionUser();
  if (user && (await resolveEmailVerifiedForUser(user))) {
    redirect(homeRouteForRole(user.role));
  }
  const showResend = Boolean(user);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24">
      <Logo size="lg" />
      <div className="mt-10 w-full max-w-sm text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40">
          <MailCheck className="size-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {signup ? "Verify your email" : "Email verification required"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {signup
            ? "Your account was created. Open the link we sent to your inbox to activate it, then sign in."
            : "Verify your email before using Buildment. Check your inbox for the link, or resend below."}
        </p>
        {showResend ? (
          <div className="mt-6">
            <ResendVerificationButton />
          </div>
        ) : null}
        <p className="mt-8 text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

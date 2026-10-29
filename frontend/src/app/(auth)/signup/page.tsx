import Link from "next/link";
import { AuthCard, AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { safeRedirectTo } from "@/shared/lib/safe-redirect";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ redirectTo?: string }> }) {
  const redirectTo = safeRedirectTo((await searchParams).redirectTo);
  return (
    <AuthPageShell>
      <AuthCard
        title="Create your account"
        description="We email you a link to confirm. Then you can start."
        mood="happy"
        line="Glad you are here."
      >
        <SignupForm redirectTo={redirectTo} />
        <p className="mt-6 text-center text-base text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : "/login"}
            className="font-bold text-primary underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}

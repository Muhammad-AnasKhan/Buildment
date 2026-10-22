import Link from "next/link";
import { AuthCard, AuthPageShell } from "@/components/auth/auth-page-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthPageShell>
      <AuthCard
        title="Create your account"
        description="Join a course and start building in minutes. We’ll email a verification link first."
      >
        <SignupForm />
        <p className="mt-[18px] text-center text-[15px] text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}

import Link from "next/link";
import { AuthCard, AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginCardTabs } from "@/components/auth/login-card-tabs";
import { TestAccountPicker } from "@/components/auth/test-account-picker";
import { devTestAccounts } from "@/server/auth/dev-test-accounts";
import { safeRedirectTo } from "@/shared/lib/safe-redirect";
import { loginErrorMessage } from "@/lib/auth-errors";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
    verified?: string;
    email?: string;
  }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirectTo(params.redirectTo);
  const errorMessage = loginErrorMessage(params.error);
  const verifiedBanner =
    params.verified === "1"
      ? `Email verified${params.email ? ` for ${params.email}` : ""}. Sign in to continue.`
      : null;
  const testAccounts = devTestAccounts();

  return (
    <AuthPageShell>
      <AuthCard
        title="Sign in"
        description="Use your email and password, or get a link by email."
        mood="wave"
        line="Welcome back."
      >
        {verifiedBanner ? (
          <p className="mb-4 border-2 border-ok bg-ok-soft px-3.5 py-3 text-[15px] text-ok">
            {verifiedBanner}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mb-4 border-2 border-destructive bg-card px-3.5 py-3 text-[15px] text-destructive">
            {errorMessage}
          </p>
        ) : null}

        <LoginCardTabs
          redirectTo={redirectTo}
          defaultEmail={params.email}
          switchToSignup={
            <>
              No account?{" "}
              <Link
                href="/signup"
                className="font-bold text-primary underline underline-offset-4"
              >
                Sign up
              </Link>
            </>
          }
        />
      </AuthCard>
      {testAccounts ? (
        <TestAccountPicker testAccounts={testAccounts} redirectTo={redirectTo} />
      ) : null}
    </AuthPageShell>
  );
}

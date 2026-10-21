import Link from "next/link";
import { MagicLinkForm, PasswordLoginForm } from "@/components/auth/login-forms";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { LoginBrandPanel } from "@/components/marketing/login-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { SEED_USERS, type SeedUserRole } from "@/shared/lib/seed-data";
import { SEED_DEV_PASSWORD } from "@/shared/lib/seed-test-users";

function devLoginRoleLabel(role: SeedUserRole): string {
  switch (role) {
    case "ADMIN":
      return "Platform admin";
    case "MENTOR":
      return "Instructor";
    case "MENTEE":
      return "Learner";
  }
}
import { safeRedirectTo } from "@/shared/lib/safe-redirect";
import { loginErrorMessage } from "@/lib/auth-errors";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string; verified?: string; email?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirectTo(params.redirectTo);
  const errorMessage = loginErrorMessage(params.error);
  const verifiedBanner =
    params.verified === "1"
      ? `Email verified${params.email ? ` for ${params.email}` : ""}. Sign in to continue.`
      : null;

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground lg:grid lg:grid-cols-2">
      <LoginBrandPanel />

      <div className="flex w-full min-w-0 flex-1 flex-col px-6 py-10 sm:px-10 lg:py-16">
        <div className="flex items-center justify-between lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo size="sm" />
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <Card className="w-full max-w-md border-border shadow-sm">
            <CardHeader className="text-center sm:text-left">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in with email and password, or use a magic link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verifiedBanner ? (
                <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
                  {verifiedBanner}
                </p>
              ) : null}
              {errorMessage ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              ) : null}

              <PasswordLoginForm redirectTo={redirectTo} defaultEmail={params.email} />

              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
                  Sign up
                </Link>
              </p>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <MagicLinkForm redirectTo={redirectTo} />
            </CardContent>
          </Card>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-8 w-full max-w-md rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Dev shortcut — seeded users (chapters unlocked for testing). Password for all:{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">{SEED_DEV_PASSWORD}</code>
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {SEED_USERS.map((seedUser) => (
                  <Link
                    key={seedUser.email}
                    href={`/api/v1/auth/dev-login?email=${encodeURIComponent(seedUser.email)}${
                      redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""
                    }`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {devLoginRoleLabel(seedUser.role)} — {seedUser.email}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground lg:hidden">
            <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

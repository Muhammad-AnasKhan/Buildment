import Link from "next/link";
import { signIn } from "@/server/auth/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { LoginBrandPanel } from "@/components/marketing/login-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { SEED_USERS } from "@/lib/seed-data";
import { safeRedirectTo } from "@/lib/safe-redirect";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo: rawRedirectTo } = await searchParams;
  const redirectTo = safeRedirectTo(rawRedirectTo);

  return (
    <div className="flex min-h-full flex-1 bg-background text-foreground lg:grid lg:grid-cols-2">
      <LoginBrandPanel />

      <div className="flex flex-col px-6 py-10 sm:px-10 lg:py-16">
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
                New here? Sign in with an invite — we create your profile on first login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: redirectTo ?? "/dashboard" });
                }}
              >
                <Button type="submit" variant="outline" className="h-10 w-full">
                  Continue with Google
                </Button>
              </form>

              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              <form
                action={async (formData) => {
                  "use server";
                  await signIn("resend", formData);
                }}
                className="space-y-3"
              >
                {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="h-10"
                  />
                </div>
                <Button type="submit" className="h-10 w-full">
                  Send magic link
                </Button>
              </form>
            </CardContent>
          </Card>

          {process.env.NODE_ENV !== "production" && (
            <div className="mt-8 w-full max-w-md rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-medium text-muted-foreground">
                Dev shortcut — seeded users (chapters unlocked for testing)
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {SEED_USERS.map((seedUser) => (
                  <Link
                    key={seedUser.email}
                    href={`/api/dev-login?email=${encodeURIComponent(seedUser.email)}${
                      redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""
                    }`}
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {seedUser.role === "MENTOR" ? "Mentor" : "Mentee"} — {seedUser.email}
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

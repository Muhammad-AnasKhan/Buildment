import Link from "next/link";
import { signIn } from "@/server/auth/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/brand/logo";
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
    <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-24">
      <Logo size="lg" />

      <div className="mt-10 w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          New here? Signing in with an invite creates your profile automatically.
        </p>

        <div className="mt-8 space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: redirectTo ?? "/dashboard" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="h-10 w-full rounded-lg border-neutral-200 text-sm font-medium"
            >
              Continue with Google
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-neutral-400">or</span>
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
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-10 rounded-lg border-neutral-200"
              />
            </div>
            <Button
              type="submit"
              className="h-10 w-full rounded-lg bg-neutral-900 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Send magic link
            </Button>
          </form>
        </div>

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-10 rounded-xl border border-neutral-200 p-4">
            <p className="text-xs font-medium text-neutral-500">
              Dev shortcut — sign in as a seeded user
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {SEED_USERS.map((seedUser) => (
                <Link
                  key={seedUser.email}
                  href={`/api/dev-login?email=${encodeURIComponent(seedUser.email)}${
                    redirectTo ? `&redirectTo=${encodeURIComponent(redirectTo)}` : ""
                  }`}
                  className="text-sm text-indigo-600 underline-offset-4 hover:underline"
                >
                  {seedUser.role === "MENTOR" ? "Mentor" : "Mentee"} — {seedUser.email}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

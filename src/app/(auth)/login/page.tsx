import Link from "next/link";
import { signIn } from "@/server/auth/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SEED_USERS } from "@/lib/seed-data";

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in to buildment</CardTitle>
          <CardDescription>
            Use your Google account, or get a one-time link by email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
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
            className="flex flex-col gap-3"
          >
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
            <Button type="submit" className="w-full">
              Send magic link
            </Button>
          </form>

          {process.env.NODE_ENV !== "production" && (
            <>
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">dev only</span>
                <Separator className="flex-1" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">
                  No Google/Resend keys yet? Sign in as a seeded user (requires{" "}
                  <code>pnpm db:seed</code>):
                </p>
                {SEED_USERS.map((seedUser) => (
                  <Link
                    key={seedUser.email}
                    href={`/api/dev-login?email=${encodeURIComponent(seedUser.email)}`}
                    className="text-sm text-primary underline underline-offset-4"
                  >
                    {seedUser.role} — {seedUser.email}
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

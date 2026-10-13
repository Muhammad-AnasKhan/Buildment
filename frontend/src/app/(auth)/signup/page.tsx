import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/logo";
import { LoginBrandPanel } from "@/components/marketing/login-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
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
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Name, email, and password. We&apos;ll email you a verification link before you can
                start learning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

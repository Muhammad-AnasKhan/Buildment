import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthMessage } from "@/components/auth/auth-message";
import { ResendVerificationButton } from "@/components/auth/resend-verification-button";
import { getSessionUser } from "@/server/auth/guards";
import { homeRouteForRole } from "@/server/auth/access-rules";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ signup?: string }>;
}) {
  const { signup } = await searchParams;
  const user = await getSessionUser();
  if (user && (user.role === "ADMIN" || user.emailVerified)) {
    redirect(homeRouteForRole(user.role));
  }
  const signedIn = Boolean(user);

  return (
    <AuthMessage
      mood="wave"
      line="Almost there."
      title={signup ? "Verify your email" : "Verify your email to start"}
      text={
        signup
          ? "Your account is ready. Open the link we sent you, then sign in."
          : "Open the link we sent you, or send it again below."
      }
    >
      <ResendVerificationButton signedIn={signedIn} />
      <p className="mt-8 text-base text-muted-foreground">
        <Link href="/login" className="font-bold text-primary underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </AuthMessage>
  );
}

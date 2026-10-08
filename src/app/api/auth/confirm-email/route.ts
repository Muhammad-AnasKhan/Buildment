import { NextRequest, NextResponse } from "next/server";
import { confirmEmailVerificationToken } from "@/server/auth/email-verification";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=verify-missing", request.url));
  }

  const result = await confirmEmailVerificationToken(token);
  if (!result.ok) {
    const param = result.reason === "expired" ? "verify-expired" : "verify-invalid";
    return NextResponse.redirect(new URL(`/login?error=${param}`, request.url));
  }

  return NextResponse.redirect(
    new URL(`/login?verified=1&email=${encodeURIComponent(result.email)}`, request.url)
  );
}

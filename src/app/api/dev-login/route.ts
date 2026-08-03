import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { homeRouteForRole } from "@/server/auth/access-rules";

// Dev-only shortcut to sign in as a seeded user without real Google/Resend credentials
// configured — see README.md "Local dev login". Mints a real database Session row and
// sets the same cookie Auth.js's database session strategy reads, so `auth()` and every
// guard in server/auth/guards.ts behave identically to a real sign-in. Disabled outside
// development so it can never ship as a production auth bypass.
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "?email= is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: `No user with email ${email} — seed the database first` }, { status: 404 });
  }

  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { sessionToken, userId: user.id, expires } });

  const response = NextResponse.redirect(new URL(homeRouteForRole(user.role), request.url));
  response.cookies.set("authjs.session-token", sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
  return response;
}

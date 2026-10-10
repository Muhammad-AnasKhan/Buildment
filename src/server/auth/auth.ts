import { randomBytes } from "node:crypto";
import NextAuth from "next-auth";
import { encode as encodeJwt } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/server/db";
import { linkLearnerProfileToUser } from "@/server/enrollment/link-learner-profile";
import { isEmailVerified } from "@/server/auth/email-verification";
import { verifyPassword } from "@/server/auth/password";
import { authConfig } from "./auth.config";
import { ensureSeedTestUserVerified, shouldAutoVerifySeedTestUser } from "./seed-test-users";

const adapter = PrismaAdapter(prisma);
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: "database", maxAge: SESSION_MAX_AGE_MS / 1000 },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user || !verifyPassword(password, user.passwordHash)) return null;
        if (!isEmailVerified(user.emailVerified)) {
          if (!shouldAutoVerifySeedTestUser(email)) return null;
          await ensureSeedTestUserVerified(email);
          user = await prisma.user.findUnique({ where: { email } });
          if (!user || !isEmailVerified(user.emailVerified)) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          canInstruct: user.canInstruct,
          emailVerified: user.emailVerified,
        };
      },
    }),
    Google,
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    // Auth.js does not persist Credentials sign-ins into a database Session by
    // default. Without this, authorize() succeeds, /dashboard flashes, then
    // requireUser() sees no cookie and bounces back to /login.
    jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.canInstruct = user.canInstruct;
      session.user.emailVerified = user.emailVerified;
      return session;
    },
  },
  jwt: {
    async encode(params) {
      if (params.token?.credentials) {
        if (!params.token.sub) {
          throw new Error("Credentials sign-in is missing a user id");
        }
        const sessionToken = randomBytes(32).toString("hex");
        const created = await adapter.createSession?.({
          sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + SESSION_MAX_AGE_MS),
        });
        if (!created) {
          throw new Error("Failed to persist credentials session");
        }
        return sessionToken;
      }
      return encodeJwt(params);
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id && user.email) {
        await linkLearnerProfileToUser(prisma, user.id, user.email);
      }
    },
  },
});

import NextAuth from "next-auth";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
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
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      session.user.canInstruct = user.canInstruct;
      session.user.emailVerified = user.emailVerified;
      return session;
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

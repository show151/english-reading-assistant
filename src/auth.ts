import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { upsertUser } from "./lib/users";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) return false;
      const dbUser = await upsertUser({
        email: user.email,
        name: user.name,
      });
      user.id = dbUser.id;
      user.role = dbUser.role;
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.dbUserId = user.id;
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as "admin" | "learner") ?? "learner";
        session.user.id = token.dbUserId as string;
      }
      return session;
    },
  },
});

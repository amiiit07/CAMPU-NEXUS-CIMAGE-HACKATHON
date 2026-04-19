import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { z } from "zod";
import { DEFAULT_TENANT_SLUG } from "@/lib/tenant-config";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Campus Nexus Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
            role: z.string().optional()
          })
          .safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        return {
          id: parsed.data.email,
          email: parsed.data.email,
          name: parsed.data.email.split("@")[0],
          role: parsed.data.role ?? "student",
          tenantId: DEFAULT_TENANT_SLUG
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "student";
        token.tenantId = (user as { tenantId?: string }).tenantId ?? DEFAULT_TENANT_SLUG;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
      tenantId?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: string;
    tenantId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    tenantId?: string;
  }
}

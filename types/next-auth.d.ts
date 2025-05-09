import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    token?: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    role: string;
  }
}

import jwt from "jsonwebtoken";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔹 Login Attempt:", credentials);

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          console.log("❌ No user found with this email:", credentials.email);
          throw new Error("No user found with this email");
        }

        console.log("✅ User found:", user.email);

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          console.log("❌ Invalid password for:", credentials.email);
          throw new Error("Invalid password");
        }

        console.log("✅ User authenticated:", user.email);

        const accessToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || "fallback_secret",
          { expiresIn: "30d" }
        );
        console.log("🔐 Generated JWT Token (inside authorize):", accessToken);

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          token: accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        token: token.accessToken,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};

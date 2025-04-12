import jwt from "jsonwebtoken";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { compare } from "bcrypt";

export const authOptions = {
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

        // ✅ Generate JWT Token
        const accessToken = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET || "fallback_secret", // ✅ Use fallback if undefined
          { expiresIn: "30d" }
        );
        console.log("🔐 Generated JWT Token (inside authorize):", accessToken);

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          token: accessToken, // ✅ Include JWT token
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔁 JWT Callback: Received token:", token, "User:", user);

      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.token; // ✅ Ensure token is stored correctly
      }
      console.log("🔐 Generated JWT Token:", token.accessToken);
      console.log("🔑 JWT Token Stored:", token); // Debugging

      return token;
    },
    async session({ session, token }) {
      if (!token || !token.accessToken) {
        console.error("❌ No token found in session callback.");
        return session;
      }
      session.user = session.user || {}; // Ensure session.user exists
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.token = token.accessToken; // ✅ Correct token property

      console.log("📦 Session Data Sent to Frontend:", session); // Debugging

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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

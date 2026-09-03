// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
    updateAge: 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      id: "user-credentials",
      name: "user-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
          },
        });

        if (
          !user ||
          !user.isActive ||
          !user.password ||
          user.role !== "USER"
        ) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),

    CredentialsProvider({
      id: "admin-credentials",
      name: "admin-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
          },
        });

        if (
          !user ||
          !user.isActive ||
          !user.password ||
          user.role !== "ADMIN"
        ) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    CredentialsProvider({
      id: "doctor-credentials",
      name: "doctor-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
          },
        });

        if (
          !user ||
          !user.isActive ||
          !user.password ||
          user.role !== "DOCTOR"
        ) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),

    CredentialsProvider({
      id: "secretary-credentials",
      name: "secretary-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
          },
        });

        if (
          !user ||
          !user.isActive ||
          !user.password ||
          user.role !== "SECRETARY"
        ) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { role: true, isActive: true },
        });

        if (
          existingUser?.role === "ADMIN" ||
          existingUser?.role === "DOCTOR" ||
          existingUser?.role === "SECRETARY"
        ) {
          return false;
        }

        if (existingUser && existingUser.isActive === false) {
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, email: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.email = dbUser.email ?? undefined;
        }
      }

      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      } else if (!token.provider) {
        token.provider = "credentials";
      }

      return token;
    },

    async session({ session, token }) {
      if (!token) return session;

      let userEmail = "";

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { email: true },
        });

        userEmail = dbUser?.email || "";
      }

      if (token.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: userEmail,
          role: token.role as "USER" | "ADMIN" | "DOCTOR" | "SECRETARY",
        };
      }

      if (token.provider) {
        session.provider = token.provider as string;
      }

      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
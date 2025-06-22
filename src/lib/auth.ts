// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password");
        }

        const email = credentials.email;

        const comparePassword = async (plain: string, hashed: string) =>
          await bcrypt.compare(plain, hashed);

        const admin = await prisma.admin.findUnique({ where: { email } });
        if (admin) {
          const isValid = await comparePassword(
            credentials.password,
            admin.password
          );
          if (!isValid) throw new Error("Invalid email or password");
          return {
            id: admin.id.toString(),
            email: admin.email,
            name: admin.name,
            image: admin.image,
            notelp: admin.notelp,
            role: admin.role,
          };
        }

        const pengelola = await prisma.pengelola.findUnique({
          where: { email },
        });
        if (pengelola) {
          const isValid = await comparePassword(
            credentials.password,
            pengelola.password
          );
          if (!isValid) throw new Error("Invalid email or password");
          if (!pengelola.isVerified)
            throw new Error("Your Pengelola account is not verified yet");
          return {
            id: pengelola.id.toString(),
            email: pengelola.email,
            name: pengelola.name,
            image: pengelola.image,
            notelp: pengelola.notelp,
            role: pengelola.role,
          };
        }

        const pengguna = await prisma.pengguna.findUnique({ where: { email } });
        if (pengguna) {
          if (!pengguna.password) {
            throw new Error(
              "This account does not have a password set. Please use another sign-in method."
            );
          }
          const isValid = await comparePassword(
            credentials.password,
            pengguna.password
          );
          if (!isValid) throw new Error("Invalid email or password");
          return {
            id: pengguna.id.toString(),
            email: pengguna.email,
            name: pengguna.name,
            image: pengguna.image,
            notelp: pengguna.notelp,
            role: pengguna.role,
          };
        }

        throw new Error("User not found");
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.notelp = user.notelp;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name; // Handle nullable name
        session.user.email = token.email; // Handle nullable email
        session.user.image = token.picture;
        session.user.notelp = token.notelp;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

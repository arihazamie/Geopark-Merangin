import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

const handler = NextAuth({
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
        // Validasi input: pastikan email dan password tersedia
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email dan password harus diisi");
        }

        // Cari user berdasarkan email, sertakan relasi untuk Pengelola dan Pengguna
        const user = await prisma.userBase.findUnique({
          where: { email: credentials.email },
          include: {
            pengelola: true, // data pengelola jika ada
            pengguna: true, // data pengguna jika ada
          },
        });

        // Jika user tidak ditemukan, lempar error
        if (!user) {
          throw new Error(" User tidak ditemukan");
        }

        // Validasi password menggunakan bcrypt
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          throw new Error("Email atau password salah");
        }

        // Jika user berperan sebagai PENGELOLA, pastikan akun sudah diverifikasi
        if (
          user.role === "PENGELOLA" &&
          user.pengelola &&
          !user.pengelola.isVerified
        ) {
          throw new Error("Akun pengelola belum terverifikasi");
        }

        // Kembalikan objek user yang berisi id, email, dan role
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Menggunakan JWT untuk session
  },
  callbacks: {
    // Callback untuk JWT: memasukkan id dan role ke token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Callback untuk session: memasukkan id dan role dari token ke session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Halaman custom login (opsional)
  },
  secret: process.env.NEXTAUTH_SECRET, // Secret key untuk enkripsi JWT
});

// Export handler untuk method GET dan POST
export { handler as GET, handler as POST };

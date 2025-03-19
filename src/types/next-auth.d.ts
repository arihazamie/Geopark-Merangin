import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// Deklarasi tipe untuk Session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null; // Opsional, sesuai dengan Prisma schema
      email?: string | null; // Opsional, sesuai dengan Prisma schema
      image?: string | null; // Ditambahkan untuk mendukung gambar
      notelp?: string | null; // Opsional, sesuai dengan Prisma schema
      role: "ADMIN" | "PENGELOLA" | "PENGGUNA"; // Enum untuk tipe aman
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    notelp?: string | null; // Opsional, sesuai dengan Prisma schema
    role: "ADMIN" | "PENGELOLA" | "PENGGUNA"; // Enum untuk tipe aman
    image?: string | null; // Ditambahkan untuk mendukung gambar
  }
}

// Deklarasi tipe untuk JWT
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    notelp?: string | null; // Opsional, sesuai dengan Prisma schema
    role: "ADMIN" | "PENGELOLA" | "PENGGUNA"; // Enum untuk tipe aman
    image?: string | null; // Sesuai dengan token.picture di authOptions
  }
}

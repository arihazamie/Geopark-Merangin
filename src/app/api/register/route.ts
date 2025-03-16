import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    // Mengambil dan memparsing data dari body request (dalam format JSON)
    const { email, password, role, notelp } = await req.json();

    // Validasi: Cek apakah email sudah terdaftar
    const existingUser = await prisma.userBase.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password sebelum menyimpannya ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Variabel untuk menyimpan data user yang akan dibuat
    let user;

    // Pembuatan user berdasarkan role yang dikirimkan
    switch (role) {
      case "ADMIN":
        // Membuat user untuk role ADMIN
        user = await prisma.userBase.create({
          data: {
            email,
            password: hashedPassword,
            role,
          },
        });
        break;

      case "PENGELOLA":
        // Validasi tambahan: Pastikan field `notelp` disertakan untuk role PENGELOLA
        if (!notelp) {
          return NextResponse.json(
            { message: "Nomor telepon wajib diisi untuk pengelola" },
            { status: 400 }
          );
        }
        // Membuat user beserta data relasi pengelola
        user = await prisma.userBase.create({
          data: {
            email,
            password: hashedPassword,
            role,
            pengelola: {
              create: {
                notelp,
              },
            },
          },
          include: { pengelola: true },
        });
        break;

      case "PENGGUNA":
        // Membuat user beserta data relasi pengguna
        user = await prisma.userBase.create({
          data: {
            email,
            password: hashedPassword,
            role,
            pengguna: {
              create: {},
            },
          },
          include: { pengguna: true },
        });
        break;

      default:
        // Jika role yang dikirimkan tidak valid, kembalikan response error
        return NextResponse.json(
          { message: "Role tidak valid" },
          { status: 400 }
        );
    }

    // Mengembalikan response dengan data user baru dan status 201 (Created)
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    // Log error untuk keperluan debugging
    console.error("Terjadi kesalahan pada server:", error);

    // Mengembalikan response error dengan status 500 (Internal Server Error)
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

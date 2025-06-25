// app/api/password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const config = {
  api: {
    bodyParser: false, // untuk dukung multipart/form-data
  },
};

// Validasi email untuk POST (minta token)
const emailSchema = z.object({
  email: z.string().email("Format email tidak valid."),
});

// POST /api/auth/reset-password
// Menghasilkan token 4 digit dan kirim ke client
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawEmail = formData.get("email");

    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { message: "Email wajib diisi." },
        { status: 400 }
      );
    }

    const { email } = emailSchema.parse({ email: rawEmail });

    const user = await prisma.pengguna.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Email tidak ditemukan." },
        { status: 404 }
      );
    }

    // Buat token 4 digit
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const randomToken = randomNumber.toString();

    console.log("Token:", randomToken);
    // Tidak disimpan ke database — token hanya dikirim ke client
    return NextResponse.json({
      message: "Token berhasil dibuat.",
      token: randomToken, // kirim ke client (disimpan di localStorage)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validasi gagal.", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan di server." },
      { status: 500 }
    );
  }
}

// PUT /api/auth/reset-password
// Client mengirim ulang token + password baru untuk ubah password
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const schema = z.object({
      email: z.string().email("Format email tidak valid."),
      token: z.string().length(4, "Token harus 4 digit."),
      newPassword: z.string().min(6, "Password minimal 6 karakter."),
    });

    const { email, token, newPassword } = schema.parse(body);

    const user = await prisma.pengguna.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Karena token tidak disimpan di server, kita anggap token valid jika cocok dengan yang dikirim ulang
    // PERINGATAN: Ini tidak aman untuk produksi

    // Hash password baru
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.pengguna.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: "Password berhasil diubah.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validasi gagal.", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan di server." },
      { status: 500 }
    );
  }
}

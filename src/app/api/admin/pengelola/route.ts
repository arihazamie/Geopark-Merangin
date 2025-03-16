// app/api/admin/pengelola/route.ts
import prismaEdge from "@/lib/prismaEdge";
const prisma = prismaEdge;
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";

/**
 * Handler untuk memperbarui status verifikasi pengelola.
 * Hanya admin yang dapat mengakses endpoint ini untuk memverifikasi pengelola.
 *
 * @param {NextRequest} req - Objek request dari Next.js
 * @returns {Promise<NextResponse>} - Response berisi status dan data pengelola yang diperbarui
 */
export async function PUT(req: NextRequest) {
  try {
    // Validasi sesi untuk peran ADMIN
    const session = await getSession({
      allowedRoles: ["ADMIN"],
    });
    if (!session) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const adminId = parseInt(session.user.id);
    if (isNaN(adminId)) {
      return NextResponse.json(
        { error: "ID admin dalam sesi tidak valid" },
        { status: 500 }
      );
    }

    // Ambil ID dari parameter query
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // Validasi ID pengelola
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: "ID pengelola tidak valid atau tidak ada" },
        { status: 400 }
      );
    }
    const pengelolaId = parseInt(id);

    // Cek keberadaan pengelola di database
    const pengelola = await prisma.pengelola.findUnique({
      where: { id: pengelolaId },
    });
    if (!pengelola) {
      return NextResponse.json(
        { error: "Pengelola tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah pengelola sudah diverifikasi sebelumnya
    if (pengelola.isVerified) {
      return NextResponse.json(
        { error: "Pengelola sudah diverifikasi" },
        { status: 400 }
      );
    }

    // Perbarui status verifikasi pengelola
    const updatedPengelola = await prisma.pengelola.update({
      where: { id: pengelolaId },
      data: {
        isVerified: true,
        verifiedBy: { connect: { id: adminId } }, // Relasi ke admin yang memverifikasi
        updatedAt: new Date(), // Set waktu pembaruan secara eksplisit
      },
      include: {
        verifiedBy: {
          select: { id: true, name: true, email: true }, // Data admin yang memverifikasi
        },
      },
    });

    // Kirim response sukses
    return NextResponse.json({
      message: "Pengelola berhasil diverifikasi",
      data: updatedPengelola,
    });
  } catch (error) {
    // Logging error dengan detail untuk debugging
    console.error("Gagal memverifikasi pengelola:", {
      error: error instanceof Error ? error.stack : error,
      requestUrl: req.url,
    });
    const message =
      error instanceof Error ? error.message : "Kesalahan Server Internal";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    // Putuskan koneksi Prisma dengan penanganan error
    await prisma.$disconnect().catch((err) => {
      console.warn("Gagal memutuskan koneksi Prisma:", err);
    });
  }
}

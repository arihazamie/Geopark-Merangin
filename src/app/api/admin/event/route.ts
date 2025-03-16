// app/api/admin/event/route.ts
import prismaEdge from "@/lib/prismaEdge";
const prisma = prismaEdge;
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";

/**
 * Handler untuk memperbarui status verifikasi event.
 * Hanya admin yang dapat mengakses endpoint ini untuk memverifikasi event.
 *
 * @param {NextRequest} req - Objek request dari Next.js
 * @returns {Promise<NextResponse>} - Response berisi status dan data event yang diperbarui
 */
export async function PUT(req: NextRequest) {
  try {
    // Validasi sesi untuk peran ADMIN
    const session = await getSession({ allowedRoles: ["ADMIN"] });
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

    // Validasi ID event
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: "ID event tidak valid atau tidak ada" },
        { status: 400 }
      );
    }
    const eventId = parseInt(id);

    // Ambil data dari body request
    const { isVerified } = await req.json(); // Tambahkan parsing body
    if (typeof isVerified !== "boolean") {
      return NextResponse.json(
        { error: "Status verifikasi tidak valid" },
        { status: 400 }
      );
    }

    // Cek keberadaan event di database
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah status sudah sama dengan yang diminta
    if (event.isVerified === isVerified) {
      return NextResponse.json(
        {
          error: `Event sudah dalam status ${
            isVerified ? "terverifikasi" : "belum diverifikasi"
          }`,
        },
        { status: 400 }
      );
    }

    // Perbarui status verifikasi event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        isVerified, // Gunakan nilai dari request body
        updatedBy: { connect: { id: adminId } },
        updatedAt: new Date(),
      },
      include: {
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
        wisata: {
          select: { id: true, name: true },
        },
        pengelola: {
          select: { id: true, name: true },
        },
      },
    });

    // Kirim response sukses
    return NextResponse.json({
      message: `Event berhasil ${
        isVerified ? "diverifikasi" : "dibatalkan verifikasinya"
      }`,
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Gagal memproses verifikasi event:", {
      error: error instanceof Error ? error.stack : error,
      requestUrl: req.url,
    });
    const message =
      error instanceof Error ? error.message : "Kesalahan Server Internal";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch((err) => {
      console.warn("Gagal memutuskan koneksi Prisma:", err);
    });
  }
}

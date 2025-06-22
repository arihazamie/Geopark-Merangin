// app/api/admin/wisata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
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

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: "ID wisata tidak valid atau tidak ada" },
        { status: 400 }
      );
    }
    const wisataId = parseInt(id);

    const wisata = await prisma.wisata.findUnique({ where: { id: wisataId } });
    if (!wisata) {
      return NextResponse.json(
        { error: "Wisata tidak ditemukan" },
        { status: 404 }
      );
    }

    // Parse FormData dari request
    const formData = await req.formData();
    const isVerified = formData.get("isVerified") === "true"; // Konversi string ke boolean

    // Update wisata dengan status verifikasi baru
    const updatedWisata = await prisma.wisata.update({
      where: { id: wisataId },
      data: {
        isVerified: isVerified,
        updatedBy: { connect: { id: adminId } },
        updatedAt: new Date(),
      },
      include: { updatedBy: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json({
      message: isVerified
        ? "Wisata berhasil diverifikasi"
        : "Verifikasi wisata dibatalkan",
      data: updatedWisata,
    });
  } catch (error) {
    console.error("Gagal memverifikasi wisata:", {
      error,
      requestUrl: req.url,
    });
    const message =
      error instanceof Error ? error.message : "Kesalahan Server Internal";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch((err: Error) => {
      console.warn("Gagal memutuskan koneksi Prisma:", err);
    });
  }
}

// app/api/admin/artikel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    // Validasi sesi untuk peran ADMIN
    const session = await getSession({
      allowedRoles: ["ADMIN"],
      redirectTo: "/",
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

    // Validasi ID artikel
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return NextResponse.json(
        { error: "ID artikel tidak valid atau tidak ada" },
        { status: 400 }
      );
    }
    const artikelId = parseInt(id);

    // Ambil data dari body request
    const body = await req.json();
    const { isVerified } = body;

    // Validasi input isVerified
    if (typeof isVerified !== "boolean") {
      return NextResponse.json(
        { error: "Status verifikasi harus berupa boolean" },
        { status: 400 }
      );
    }

    // Cek keberadaan artikel di database
    const artikel = await prisma.artikel.findUnique({
      where: { id: artikelId },
    });
    if (!artikel) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika status yang diminta sama dengan status saat ini, kembalikan error
    if (artikel.isVerified === isVerified) {
      return NextResponse.json(
        {
          error: artikel.isVerified
            ? "Artikel sudah diverifikasi"
            : "Artikel belum diverifikasi",
        },
        { status: 400 }
      );
    }

    // Perbarui status verifikasi artikel
    const updatedArtikel = await prisma.artikel.update({
      where: { id: artikelId },
      data: {
        isVerified: isVerified,
        updatedBy: { connect: { id: adminId } },
        updatedAt: new Date(),
      },
      include: {
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
        pengelola: {
          select: { id: true, name: true },
        },
      },
    });

    // Kirim response sukses
    return NextResponse.json({
      message: isVerified
        ? "Artikel berhasil diverifikasi"
        : "Verifikasi artikel berhasil dibatalkan",
      data: updatedArtikel,
    });
  } catch (error) {
    console.error("Gagal memperbarui status verifikasi artikel:", {
      error: error instanceof Error ? error.stack : error,
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

export async function GET(req: NextRequest) {
  try {
    // Validasi sesi untuk peran ADMIN
    const session = await getSession({
      allowedRoles: ["ADMIN"],
      redirectTo: "/",
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

    const artikel = await prisma.artikel.findMany({
      include: {
        updatedBy: {
          select: { id: true, name: true, email: true },
        },
        pengelola: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(artikel);
  } catch (error) {
    console.error("Gagal mengambil artikel:", {
      error: error instanceof Error ? error.stack : error,
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

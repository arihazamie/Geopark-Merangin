// app/api/ulasan/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"; // Untuk validasi data
import { getSession } from "@/lib/authRoute";
import { prisma } from "@/lib/prisma";

// Schema validasi untuk membuat ulasan
const createUlasanSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  comment: z.string().min(1),
  wisataId: z.number().optional(),
  artikelId: z.number().optional(),
  eventId: z.number().optional(),
});

// Schema validasi untuk update ulasan
const updateUlasanSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  comment: z.string().min(1).optional(),
});

// GET: Mendapatkan semua ulasan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wisataId = searchParams.get("wisataId");
    const artikelId = searchParams.get("artikelId");
    const eventId = searchParams.get("eventId");

    const ulasans = await prisma.ulasan.findMany({
      where: {
        ...(wisataId && { wisataId: Number(wisataId) }),
        ...(artikelId && { artikelId: Number(artikelId) }),
        ...(eventId && { eventId: Number(eventId) }),
      },
      include: {
        pengguna: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        wisata: {
          select: {
            id: true,
            name: true,
          },
        },
        artikel: {
          select: {
            id: true,
            title: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(ulasans, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil ulasan", err },
      { status: 500 }
    );
  }
}

// DELETE: Menghapus ulasan
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID ulasan diperlukan" },
        { status: 400 }
      );
    }

    const ulasan = await prisma.ulasan.findUnique({
      where: { id: Number(id) },
    });

    if (!ulasan) {
      return NextResponse.json(
        { error: "Ulasan tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.ulasan.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Ulasan berhasil dihapus" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus ulasan", err },
      { status: 500 }
    );
  }
}

// POST: Membuat ulasan baru
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createUlasanSchema.parse(body);

    // Pastikan hanya satu dari wisataId, artikelId, atau eventId yang diisi
    const targetCount = [
      validatedData.wisataId,
      validatedData.artikelId,
      validatedData.eventId,
    ].filter(Boolean).length;
    if (targetCount !== 1) {
      return NextResponse.json(
        {
          error:
            "Harus memilih tepat satu target (wisata, artikel, atau event)",
        },
        { status: 400 }
      );
    }

    const ulasan = await prisma.ulasan.create({
      data: {
        ...validatedData,
        penggunaId: Number(session.user.id),
      },
    });

    return NextResponse.json(ulasan, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat ulasan" },
      { status: 500 }
    );
  }
}

// PUT: Mengupdate ulasan
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID ulasan diperlukan" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateUlasanSchema.parse(body);

    const ulasan = await prisma.ulasan.findUnique({
      where: { id: Number(id) },
    });

    if (!ulasan) {
      return NextResponse.json(
        { error: "Ulasan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (
      ulasan.penggunaId !== Number(session.user.id) &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedUlasan = await prisma.ulasan.update({
      where: { id: Number(id) },
      data: {
        ...validatedData,
        updatedById:
          session.user.role === "ADMIN" ? Number(session.user.id) : undefined,
      },
    });

    return NextResponse.json(updatedUlasan, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengupdate ulasan" },
      { status: 500 }
    );
  }
}

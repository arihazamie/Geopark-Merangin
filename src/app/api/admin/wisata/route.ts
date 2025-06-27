// app/api/admin/wisata/route.ts
import { type NextRequest, NextResponse } from "next/server";
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

    const adminId = Number.parseInt(session.user.id);
    if (isNaN(adminId)) {
      return NextResponse.json(
        { error: "ID admin dalam sesi tidak valid" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number.parseInt(id)) || Number.parseInt(id) <= 0) {
      return NextResponse.json(
        { error: "ID wisata tidak valid atau tidak ada" },
        { status: 400 }
      );
    }
    const wisataId = Number.parseInt(id);

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

    // Get additional fields that admin can update
    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const location = formData.get("location")?.toString();
    const type = formData.get("type")?.toString();
    const latitude = formData.get("latitude")?.toString();
    const longitude = formData.get("longitude")?.toString();

    // New fields for pricing and operating hours
    const ticketPrice = formData.get("ticketPrice")?.toString();
    const openingTime = formData.get("openingTime")?.toString();
    const closingTime = formData.get("closingTime")?.toString();

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (openingTime && !timeRegex.test(openingTime)) {
      return NextResponse.json(
        { error: "Format jam buka tidak valid (gunakan HH:MM)" },
        { status: 400 }
      );
    }
    if (closingTime && !timeRegex.test(closingTime)) {
      return NextResponse.json(
        { error: "Format jam tutup tidak valid (gunakan HH:MM)" },
        { status: 400 }
      );
    }

    // Validate ticket price if provided
    if (
      ticketPrice &&
      (isNaN(Number.parseFloat(ticketPrice)) ||
        Number.parseFloat(ticketPrice) < 0)
    ) {
      return NextResponse.json(
        { error: "Harga tiket harus berupa angka positif" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      isVerified: isVerified,
      updatedBy: { connect: { id: adminId } },
      updatedAt: new Date(),
    };

    // Add optional fields if provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type || null;
    if (latitude !== undefined)
      updateData.latitude = latitude ? Number.parseFloat(latitude) : undefined;
    if (longitude !== undefined)
      updateData.longitude = longitude
        ? Number.parseFloat(longitude)
        : undefined;

    // Add new fields
    if (ticketPrice !== undefined) {
      updateData.ticketPrice = ticketPrice
        ? Number.parseFloat(ticketPrice)
        : null;
    }
    if (openingTime !== undefined) {
      updateData.openingTime = openingTime || null;
    }
    if (closingTime !== undefined) {
      updateData.closingTime = closingTime || null;
    }

    // Update wisata dengan data baru
    const updatedWisata = await prisma.wisata.update({
      where: { id: wisataId },
      data: updateData,
      include: {
        updatedBy: { select: { id: true, name: true, email: true } },
        pengelola: { select: { id: true, name: true } },
      },
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

export async function GET(req: NextRequest) {
  try {
    const session = await getSession({ allowedRoles: ["ADMIN"] });
    if (!session) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const status = url.searchParams.get("status"); // 'verified', 'unverified', or 'all'

    // Get single wisata by ID
    if (id) {
      if (isNaN(Number.parseInt(id)) || Number.parseInt(id) <= 0) {
        return NextResponse.json(
          { error: "ID wisata tidak valid" },
          { status: 400 }
        );
      }

      const wisata = await prisma.wisata.findUnique({
        where: { id: Number.parseInt(id) },
        include: {
          pengelola: { select: { id: true, name: true, email: true } },
          updatedBy: { select: { id: true, name: true, email: true } },
          _count: { select: { ulasans: true } },
        },
      });

      if (!wisata) {
        return NextResponse.json(
          { error: "Wisata tidak ditemukan" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: wisata });
    }

    // Get all wisata with optional status filter
    const whereClause: any = {};
    if (status === "verified") {
      whereClause.isVerified = true;
    } else if (status === "unverified") {
      whereClause.isVerified = false;
    }

    const wisatas = await prisma.wisata.findMany({
      where: whereClause,
      include: {
        pengelola: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { ulasans: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: wisatas });
  } catch (error) {
    console.error("Gagal mengambil data wisata:", error);
    const message =
      error instanceof Error ? error.message : "Kesalahan Server Internal";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await prisma.$disconnect().catch((err: Error) => {
      console.warn("Gagal memutuskan koneksi Prisma:", err);
    });
  }
}

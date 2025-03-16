// app/api/event/route.ts
import { NextRequest, NextResponse } from "next/server";
import prismaEdge from "@/lib/prismaEdge";
const prisma = prismaEdge;
import { getSession } from "@/lib/authRoute";
import { createImageHandler } from "@/lib/imageHandler";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const eventId = Number(id);
      if (isNaN(eventId)) {
        return NextResponse.json(
          { error: "ID harus berupa angka" },
          { status: 400 }
        );
      }

      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          wisata: { select: { id: true, name: true } },
          pengelola: { select: { id: true, name: true } },
          updatedBy: { select: { id: true, name: true } },
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Event tidak ditemukan" },
          { status: 404 }
        );
      }
      return NextResponse.json(event);
    }

    const events = await prisma.event.findMany({
      include: {
        wisata: { select: { id: true, name: true } },
        pengelola: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
      },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Gagal mengambil event:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

const imageHandler = createImageHandler({
  uploadDir: "/event",
  prefix: "event",
});

/**
 * @desc Membuat event baru
 * @route POST /api/event
 * @access Private (ADMIN, PENGELOLA)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession({
      allowedRoles: ["ADMIN", "PENGELOLA"],
    });

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const wisataId = Number(formData.get("wisataId"));
    const imageFiles = formData.getAll("images") as File[];

    // Validasi input
    if (
      !title ||
      !description ||
      !startDate ||
      !endDate ||
      !wisataId ||
      imageFiles.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Semua field (title, description, startDate, endDate, wisataId, images) wajib diisi",
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "startDate harus sebelum endDate" },
        { status: 400 }
      );
    }

    // Validasi wisataId
    const wisata = await prisma.wisata.findUnique({
      where: { id: wisataId },
    });
    if (!wisata) {
      return NextResponse.json(
        { error: "Wisata tidak ditemukan" },
        { status: 404 }
      );
    }

    // Process images
    const imageUrls = await imageHandler.processImages(imageFiles);
    const image = imageUrls[0]; // Assuming single image for simplicity

    const event = await prisma.event.create({
      data: {
        title,
        description,
        image,
        startDate: start,
        endDate: end,
        wisata: { connect: { id: wisataId } },
        pengelola:
          session.user.role === "PENGELOLA"
            ? { connect: { id: Number(session.user.id) } }
            : undefined,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat event:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

/**
 * @desc Mengupdate event berdasarkan ID
 * @route PUT /api/event?id={id}
 * @access Private (ADMIN, PENGELOLA)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession({
      allowedRoles: ["ADMIN", "PENGELOLA"],
    });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter ID wajib disertakan" },
        { status: 400 }
      );
    }

    const eventId = Number(id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "ID harus berupa angka" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const wisataId = Number(formData.get("wisataId"));
    const imageFiles = formData.getAll("images") as File[];

    // Validasi input
    if (!title || !description || !startDate || !endDate || !wisataId) {
      return NextResponse.json(
        {
          error:
            "Semua field (title, description, startDate, endDate, wisataId) wajib diisi",
        },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Format tanggal tidak valid" },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: "startDate harus sebelum endDate" },
        { status: 400 }
      );
    }

    const wisata = await prisma.wisata.findUnique({
      where: { id: wisataId },
    });
    if (!wisata) {
      return NextResponse.json(
        { error: "Wisata tidak ditemukan" },
        { status: 404 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner =
      session.user.role === "PENGELOLA" &&
      event.pengelolaId === Number(session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Tidak memiliki izin untuk mengupdate event ini" },
        { status: 403 }
      );
    }

    let image = event.image;
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = await imageHandler.processImages(imageFiles);
      image = imageUrls[0];
      if (event.image) {
        await imageHandler.cleanupFiles([event.image]);
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        image,
        startDate: start,
        isVerified: false,
        endDate: end,
        wisata: { connect: { id: wisataId } },
        updatedBy: isAdmin
          ? { connect: { id: Number(session.user.id) } }
          : undefined,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Gagal mengupdate event:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

/**
 * @desc Menghapus event berdasarkan ID
 * @route DELETE /api/event?id={id}
 * @access Private (ADMIN, PENGELOLA)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession({
      allowedRoles: ["ADMIN", "PENGELOLA"],
    });

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter ID wajib disertakan" },
        { status: 400 }
      );
    }

    const eventId = Number(id);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "ID harus berupa angka" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event tidak ditemukan" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner =
      session.user.role === "PENGELOLA" &&
      event.pengelolaId === Number(session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Tidak memiliki izin untuk menghapus event ini" },
        { status: 403 }
      );
    }

    // Clean up image file before deleting the event
    if (event.image) {
      await imageHandler.cleanupFiles([event.image]);
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ message: "Event berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus event:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false, // Required for handling multipart/form-data
  },
};

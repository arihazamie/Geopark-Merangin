// app/api/wisata/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";
import { createImageHandler } from "@/lib/imageHandler";

// Nonaktifkan body parser bawaan agar kita bisa menggunakan request.formData()
export const config = {
  api: {
    bodyParser: false,
  },
};

const getSchema = z.object({
  id: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .optional(),
  populer: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

export async function GET(request: Request) {
  const timestamp = new Date().toISOString();

  try {
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const { id, populer } = getSchema.parse(Object.fromEntries(searchParams));

    // Log request details
    console.log("GET /api/wisata request:", {
      url: request.url,
      userAgent: request.headers.get("user-agent"),
      timestamp,
    });

    // Handle single record request
    if (id !== undefined) {
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: "ID harus berupa angka" },
          { status: 400 }
        );
      }

      const wisata = await prisma.wisata.findUnique({
        where: { id },
        include: {
          pengelola: true,
          updatedBy: true,
          _count: {
            select: {
              ulasans: true,
            },
          },
        },
      });

      if (!wisata) {
        return NextResponse.json(
          { success: false, error: "Wisata tidak ditemukan" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: wisata });
    }

    // Handle all records request
    const wisatas = await prisma.wisata.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        latitude: true,
        longitude: true,
        images: true,
        type: true,
        location: true,
        isVerified: true,
        pengelolaId: true,
        createdAt: true,
        updatedAt: true,
        pengelola: {
          select: {
            id: true,
            name: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            ulasans: true,
          },
        },
      },
      orderBy: populer
        ? {
            ulasans: {
              _count: "desc",
            },
          }
        : {
            createdAt: "asc",
          },
    });

    return NextResponse.json({
      success: true,
      data: wisatas,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    // Log detailed error
    console.error("Error in GET /api/wisata:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp,
    });

    return NextResponse.json(
      { success: false, error: "Gagal mengambil data wisata" },
      { status: 500 }
    );
  }
}

const imageHandler = createImageHandler({
  uploadDir: "wisata", // Removed leading slash to work better with Vercel Blob
  allowedTypes: /^image\/(jpeg|jpg|png)$/, // Fixed regex to match content-type format
  maxFileSize: 3 * 1024 * 1024, // 2MB
  prefix: "wisata",
});

/**
 * POST: Membuat data wisata baru.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const location = formData.get("location")?.toString();
    const type = formData.get("type")?.toString();
    const reviews = formData.get("reviews")?.toString(); // Hanya reviews yang ada di model
    const latitude = formData.get("latitude")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const pengelolaId = formData.get("pengelolaId")?.toString();
    const isVerified = formData.get("isVerified")?.toString() === "true";

    if (!name || !description || !location) {
      return NextResponse.json(
        { error: "Nama, deskripsi, dan lokasi wajib diisi" },
        { status: 400 }
      );
    }

    const imagesFiles = formData.getAll("images");
    let images: string[] = [];
    if (imagesFiles && imagesFiles.length > 0) {
      images = await imageHandler.processImages(imagesFiles as File[]);
    }

    const newWisata = await prisma.wisata.create({
      data: {
        name,
        description,
        location,
        type: type || undefined,
        latitude: latitude ? parseFloat(latitude) : 0,
        longitude: longitude ? parseFloat(longitude) : 0,
        images,
        pengelolaId: pengelolaId ? parseInt(pengelolaId) : undefined,
        isVerified: isVerified || false,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(newWisata, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal membuat Wisata" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Memperbarui data wisata berdasarkan ID.
 */
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Parameter id tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString();
    const description = formData.get("description")?.toString();
    const location = formData.get("location")?.toString();
    const type = formData.get("type")?.toString();
    const reviews = formData.get("reviews")?.toString(); // Hanya reviews
    const latitude = formData.get("latitude")?.toString();
    const longitude = formData.get("longitude")?.toString();
    const pengelolaId = formData.get("pengelolaId")?.toString();
    const updatedById = formData.get("updatedById")?.toString();

    const imagesFiles = formData.getAll("images");
    let images: string[] | undefined = undefined;
    if (
      imagesFiles &&
      imagesFiles.length > 0 &&
      imagesFiles[0] instanceof File &&
      imagesFiles[0].size > 0
    ) {
      images = await imageHandler.processImages(imagesFiles as File[]);
    }

    const updatedWisata = await prisma.wisata.update({
      where: { id: Number(id) },
      data: {
        name: name || undefined,
        description: description || undefined,
        location: location || undefined,
        type: type || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        pengelolaId: pengelolaId ? parseInt(pengelolaId) : undefined,
        isVerified: false,
        images: images || undefined,
        updatedById: updatedById ? parseInt(updatedById) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedWisata, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Gagal memperbarui Wisata" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Parameter id tidak ditemukan" },
      { status: 400 }
    );
  }

  try {
    // Cari wisata yang akan dihapus untuk mendapatkan daftar gambar
    const wisata = await prisma.wisata.findUnique({
      where: { id: Number(id) },
      select: { id: true, images: true }, // Hanya ambil yang diperlukan
    });

    if (!wisata) {
      return NextResponse.json(
        { error: "Wisata tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus record dari database
    const deletedWisata = await prisma.wisata.delete({
      where: { id: Number(id) },
    });

    // Bersihkan file gambar jika ada
    if (wisata.images && wisata.images.length > 0) {
      try {
        await imageHandler.cleanupFiles(wisata.images);
      } catch (cleanupError) {
        console.warn("Failed to cleanup image files:", cleanupError);
        // Jangan gagal operasi DELETE hanya karena cleanup gagal
      }
    }

    return NextResponse.json(deletedWisata, { status: 200 });
  } catch (error) {
    console.error("Error deleting wisata:", error);
    return NextResponse.json(
      { error: "Gagal menghapus Wisata" },
      { status: 500 }
    );
  }
}

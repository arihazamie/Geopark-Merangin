// app/api/artikel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";
import { createImageHandler } from "@/lib/imageHandler";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Convert string to number
      const articleId = Number(id);

      // Check if conversion resulted in a valid number
      if (isNaN(articleId)) {
        return NextResponse.json(
          { error: "ID artikel tidak valid" },
          { status: 400 }
        );
      }

      // Ambil artikel spesifik berdasarkan ID
      const article = await prisma.artikel.findUnique({
        where: { id: articleId },
        include: {
          pengelola: {
            select: { id: true, name: true },
          },
          updatedBy: {
            select: { id: true, name: true },
          },
        },
      });

      if (!article) {
        return NextResponse.json(
          { error: "Artikel tidak ditemukan" },
          { status: 404 }
        );
      }

      return NextResponse.json({ data: article });
    }

    // Ambil semua artikel
    const articles = await prisma.artikel.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pengelola: {
          select: { id: true, name: true },
        },
        updatedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ data: articles });
  } catch (error) {
    console.error("Gagal mengambil artikel:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

const imageHandler = createImageHandler({
  uploadDir: "artikel", // Removed leading slash to work better with Vercel Blob
  allowedTypes: /^image\/(jpeg|jpg|png)$/, // Fixed regex to match content-type format
  maxFileSize: 3 * 1024 * 1024, // 2MB
  prefix: "artikel",
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession({
      allowedRoles: ["ADMIN", "PENGELOLA"],
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const images = formData.getAll("images") as File[];

    if (!title || !description || !content || !images || images.length === 0) {
      return NextResponse.json(
        {
          error:
            "Semua field (title, description, content, images) wajib diisi",
        },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json(
        { error: "Judul tidak boleh lebih dari 100 karakter" },
        { status: 400 }
      );
    }

    const imageUrls = await imageHandler.processImages(images);
    const image = imageUrls[0];

    const artikel = await prisma.artikel.create({
      data: {
        title,
        description,
        content,
        image,
        pengelolaId:
          session.user.role === "PENGELOLA" ? Number(session.user.id) : null,
      },
    });

    return NextResponse.json(artikel, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat artikel:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession({ allowedRoles: ["ADMIN", "PENGELOLA"] });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const artikelId = id ? Number(id) : NaN;
    if (!id || isNaN(artikelId)) {
      return NextResponse.json(
        { error: "ID artikel tidak valid" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const images = formData.getAll("images") as File[];
    const isVerifiedInput = formData.get("isVerified");

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Semua field (title, description, content) wajib diisi" },
        { status: 400 }
      );
    }
    if (title.length > 100) {
      return NextResponse.json(
        { error: "Judul tidak boleh lebih dari 100 karakter" },
        { status: 400 }
      );
    }

    const artikel = await prisma.artikel.findUnique({
      where: { id: artikelId },
      select: { id: true, image: true, pengelolaId: true, isVerified: true },
    });
    if (!artikel) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner =
      session.user.role === "PENGELOLA" &&
      artikel.pengelolaId === Number(session.user.id);
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Tidak memiliki izin untuk mengupdate artikel ini" },
        { status: 403 }
      );
    }

    let image = artikel.image;
    if (images?.length && images[0].size > 0) {
      const validImages = images.filter((img) => img.size > 0);
      if (!validImages.length) {
        return NextResponse.json(
          { error: "Gambar yang diunggah tidak valid" },
          { status: 400 }
        );
      }
      try {
        const imageUrls = await imageHandler.processImages(validImages);
        image = imageUrls[0];
        if (artikel.image && image !== artikel.image) {
          await imageHandler.cleanupFiles([artikel.image]);
        }
      } catch (imageError) {
        console.error("Gagal memproses gambar:", imageError);
        return NextResponse.json(
          { error: "Gagal memproses gambar" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      title,
      description,
      content,
      image,
      updatedById: isAdmin ? Number(session.user.id) : null,
      updatedAt: new Date(),
    };

    // Only admins can change isVerified, and only if provided and different
    if (isAdmin && isVerifiedInput !== null) {
      const verifiedStatus =
        isVerifiedInput === "true" || Boolean(isVerifiedInput);
      if (artikel.isVerified !== verifiedStatus) {
        updateData.isVerified = verifiedStatus;
      }
    } else {
      // Preserve existing isVerified for non-admins or if not provided
      updateData.isVerified = artikel.isVerified;
    }

    const updatedArtikel = await prisma.artikel.update({
      where: { id: artikelId },
      data: updateData,
      include: {
        pengelola: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      message: "Artikel berhasil diperbarui",
      data: updatedArtikel,
    });
  } catch (error) {
    console.error("Gagal mengupdate artikel:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession({
      allowedRoles: ["ADMIN", "PENGELOLA"],
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter ID wajib disertakan" },
        { status: 400 }
      );
    }

    const artikelId = Number(id);
    if (isNaN(artikelId)) {
      return NextResponse.json(
        { error: "ID harus berupa angka" },
        { status: 400 }
      );
    }

    const artikel = await prisma.artikel.findUnique({
      where: { id: artikelId },
    });

    if (!artikel) {
      return NextResponse.json(
        { error: "Artikel tidak ditemukan" },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN";
    const isOwner =
      session.user.role === "PENGELOLA" &&
      artikel.pengelolaId === Number(session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Tidak memiliki izin untuk menghapus artikel ini" },
        { status: 403 }
      );
    }

    if (artikel.image) {
      await imageHandler.cleanupFiles([artikel.image]);
    }

    await prisma.artikel.delete({
      where: { id: artikelId },
    });

    return NextResponse.json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus artikel:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}

// app/api/pengguna/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";
import { createImageHandler } from "@/lib/imageHandler";
import prismaEdge from "@/lib/prismaEdge";
const prisma = prismaEdge;

// Create image handler instance
const imageHandler = createImageHandler({
  uploadDir: "profile",
  allowedTypes: /^image\/(jpeg|png|jpg|webp)$/,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  prefix: "profile",
});

// Handler untuk metode PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Optional: Cek autentikasi jika diperlukan
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Await params before using it
    const { id } = await params;

    // Check if the request is multipart/form-data or application/json
    const contentType = request.headers.get("content-type") || "";
    let name, email, notelp, image;
    let oldImageUrl = null;

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data (with file upload)
      const formData = await request.formData();
      name = formData.get("name") as string;
      email = formData.get("email") as string;
      notelp = formData.get("notelp") as string;

      // Get the old image URL if provided (for cleanup)
      oldImageUrl = formData.get("oldImageUrl") as string;

      // Check if a new image file was uploaded
      const imageFile = formData.get("image") as File;

      if (imageFile && imageFile.size > 0) {
        // Process the image file and get the URL
        image = await imageHandler.processImage(imageFile);

        // If there's an old image and it's different from the default, delete it
        if (
          oldImageUrl &&
          !oldImageUrl.includes("placeholder.svg") &&
          !oldImageUrl.includes("default-avatar")
        ) {
          try {
            await imageHandler.cleanupFiles([oldImageUrl]);
            console.log("Old image deleted:", oldImageUrl);
          } catch (error) {
            console.error("Failed to delete old image:", error);
          }
        }
      } else {
        // No new image uploaded, keep the old one
        image = oldImageUrl;
      }
    } else {
      // Handle JSON data (no file upload)
      const body = await request.json();
      name = body.name;
      email = body.email;
      notelp = body.notelp;
      image = body.image;
    }

    // Validasi input
    if (!name && !notelp && !email && !image) {
      return NextResponse.json(
        { error: "At least one field must be provided to update" },
        { status: 400 }
      );
    }

    // Validasi format email jika ada
    if (email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Update data pengguna
    const updatedUser = await prisma.pengguna.update({
      where: { id: Number.parseInt(id) },
      data: {
        ...(name && { name }),
        ...(notelp && { notelp }),
        ...(email && { email }),
        ...(image && { image }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        notelp: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle error spesifik
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Optional: Handler untuk GET (melihat data pengguna sebelum update)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.pengguna.findUnique({
      where: { id: Number.parseInt(id) },
      select: {
        id: true,
        name: true,
        notelp: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

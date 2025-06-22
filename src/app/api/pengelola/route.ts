// app/api/pengelola/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/authRoute";
import bcrypt from "bcryptjs";
import { z } from "zod"; // Tambahkan zod untuk validasi schema
import { createImageHandler } from "@/lib/imageHandler";

export async function GET() {
  try {
    const session = await getSession({ allowedRoles: ["ADMIN"] });
    if (!session) {
      return NextResponse.json(
        { message: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    // Ambil data pengelola
    const pengelolaList = await prisma.pengelola.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        notelp: true,
        image: true,
        isVerified: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        verifiedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Berhasil mengambil daftar pengelola",
      data: {
        pengelola: pengelolaList,
      },
    });
  } catch (error) {
    console.error("Error fetching pengelola:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

const imageHandler = createImageHandler({
  uploadDir: "profile", // Removed leading slash to work better with Vercel Blob
  allowedTypes: /^image\/(jpeg|jpg|png)$/, // Fixed regex to match content-type format
  maxFileSize: 3 * 1024 * 1024, // 2MB
  prefix: "profile",
});

// Schema validasi untuk PUT
const updatePengelolaSchema = z.object({
  id: z.number().positive("ID harus angka positif"),
  name: z.string().min(1, "Nama harus diisi").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  notelp: z.string().min(1, "Nomor telepon harus diisi").optional(),
  password: z.string().min(8, "Kata sandi harus minimal 8 karakter").optional(),
  isVerified: z.boolean().optional(),
});

// Schema validasi untuk DELETE
const deletePengelolaSchema = z.object({
  id: z.number().positive("ID harus angka positif"),
});

export async function POST(request: Request) {
  try {
    console.log("Received registration request"); // Debug log
    const formData = await request.formData();

    if (!formData) {
      return NextResponse.json(
        { message: "Invalid form data received" },
        { status: 400 }
      );
    }

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "ADMIN" | "PENGELOLA" | "PENGGUNA";
    const name = formData.get("name") as string | undefined;
    const noTelepon = formData.get("noTelepon") as string | undefined;
    const image = formData.get("image") as File | null;

    // Validate required fields
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "Email is required and must be a string" },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { message: "Password is required and must be a string" },
        { status: 400 }
      );
    }
    if (!role || !["ADMIN", "PENGELOLA", "PENGGUNA"].includes(role)) {
      return NextResponse.json(
        { message: "Valid role is required (ADMIN, PENGELOLA, PENGGUNA)" },
        { status: 400 }
      );
    }
    if (role === "PENGELOLA" || role === "PENGGUNA") {
      if (!name || typeof name !== "string") {
        return NextResponse.json(
          { message: "Name is required for this role" },
          { status: 400 }
        );
      }
      if (!noTelepon || typeof noTelepon !== "string") {
        return NextResponse.json(
          { message: "Phone number is required for this role" },
          { status: 400 }
        );
      }
    }

    // Check for existing user
    console.log("Checking existing user for email:", email); // Debug log
    let existingUser;
    if (role === "ADMIN") {
      existingUser = await prisma.admin.findUnique({ where: { email } });
    } else if (role === "PENGELOLA") {
      existingUser = await prisma.pengelola.findUnique({ where: { email } }); // Changed to findUnique
    } else if (role === "PENGGUNA") {
      existingUser = await prisma.pengguna.findUnique({ where: { email } }); // Changed to findUnique
    }
    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    console.log("Hashing password"); // Debug log
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle image upload
    let imagePath = "/uploads/default-avatar.png";
    if (image) {
      console.log("Processing image upload"); // Debug log
      try {
        const imagePaths = await imageHandler.processImages([image]);
        if (!imagePaths || imagePaths.length === 0) {
          return NextResponse.json(
            { message: "Gagal mengunggah gambar" },
            { status: 400 }
          );
        }
        imagePath = imagePaths[0];
      } catch (imageError) {
        console.error("Image upload error:", imageError);
        return NextResponse.json(
          { message: "Failed to upload image" },
          { status: 400 }
        );
      }
    }

    // Create user based on role
    console.log("Creating user with role:", role); // Debug log
    let user;
    if (role === "ADMIN") {
      user = await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          role: "ADMIN",
          name: name || "Admin",
          notelp: noTelepon || "",
          image: imagePath,
        },
      });
    } else if (role === "PENGELOLA") {
      user = await prisma.pengelola.create({
        data: {
          name: name!,
          email,
          password: hashedPassword,
          notelp: noTelepon!,
          role: "PENGELOLA",
          image: imagePath,
        },
      });
    } else if (role === "PENGGUNA") {
      user = await prisma.pengguna.create({
        data: {
          name: name!,
          email,
          password: hashedPassword,
          notelp: noTelepon!,
          role: "PENGGUNA",
          image: imagePath,
        },
      });
    }

    console.log("Data diterima:", formData);
    return NextResponse.json(
      { message: "Registrasi berhasil" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Kesalahan di server:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession({ allowedRoles: ["ADMIN"] });
    if (!session) {
      return NextResponse.json(
        { message: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }
    const adminId = parseInt(session.user.id);

    const body = await req.json();
    const validatedData = updatePengelolaSchema.parse(body);

    const pengelola = await prisma.pengelola.findUnique({
      where: { id: validatedData.id },
    });

    if (!pengelola) {
      return NextResponse.json(
        { message: "Pengelola tidak ditemukan" },
        { status: 404 }
      );
    }

    if (validatedData.email && validatedData.email !== pengelola.email) {
      const existingEmail = await prisma.pengelola.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { message: "Email sudah digunakan" },
          { status: 409 }
        );
      }
    }

    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      notelp: validatedData.notelp,
      isVerified: validatedData.isVerified,
      updatedAt: new Date(),
    };

    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }

    if (validatedData.isVerified !== undefined && validatedData.isVerified) {
      updateData.verifiedById = adminId;
    }

    const updatedPengelola = await prisma.pengelola.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        verifiedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json({
      message: "Pengelola berhasil diperbarui",
      data: updatedPengelola,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validasi gagal", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating pengelola:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession({ allowedRoles: ["ADMIN"] });
    if (!session) {
      return NextResponse.json(
        { message: "Autentikasi diperlukan" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = deletePengelolaSchema.parse(body);

    const pengelola = await prisma.pengelola.findUnique({
      where: { id: validatedData.id },
    });

    if (!pengelola) {
      return NextResponse.json(
        { message: "Pengelola tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.pengelola.delete({
      where: { id: validatedData.id },
    });

    return NextResponse.json({
      message: "Pengelola berhasil dihapus",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validasi gagal", errors: error.errors },
        { status: 400 }
      );
    }
    console.error("Error deleting pengelola:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server internal" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prismaEdge from "@/lib/prismaEdge";
const prisma = prismaEdge;
import { createImageHandler } from "@/lib/imageHandler";

const imageHandler = createImageHandler({
  uploadDir: "/profile",
  prefix: "/profile",
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

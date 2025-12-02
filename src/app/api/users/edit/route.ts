import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcrypt";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  userId: z.number("User ID harus berupa angka."),
  name: z
    .string("Nama harus berupa string.")
    .min(1, "Nama pengguna harus diisi."),
  username: z
    .string("Username harus berupa string.")
    .min(1, "Username harus diisi.")
    .lowercase("Username harus berupa huruf kecil."),
  email: z.string("Email harus berupa string.").min(1, "Email harus diisi."),
  password: z.string("Kata sandi harus berupa string."),
  confirmPassword: z.string("Konfirmasi kata sandi harus berupa string."),
  roleId: z.number("Role ID harus berupa angka."),
});

export async function PUT(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);

    // If no session, return unauthorized
    if (!session) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // If the user is not a manager, return forbidden
    if (!session.user.role || session.user.role !== "Manager") {
      return NextResponse.json(
        {
          status: "error",
          message: "Forbidden",
        },
        { status: 403 }
      );
    }

    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      userId: Number(formData.get("userId")),
      name: String(formData.get("name")),
      username: String(formData.get("username")),
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      confirmPassword: String(formData.get("confirmPassword")),
      roleId: Number(formData.get("roleId")),
    });

    // Validate the request parameters
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          status: "error",
          error: validatedFields.error.name,
          message: validatedFields.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    // Check if the user exists
    const existingUser = await prisma.users.findUnique({
      where: {
        userId: validatedFields.data.userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "Pengguna dengan ID tersebut tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // Check if password and confirmPassword match
    if (
      validatedFields.data.password !== validatedFields.data.confirmPassword
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Kata sandi dan konfirmasi kata sandi tidak cocok.",
        },
        { status: 400 }
      );
    }

    // Check if the roleId exists
    const roleExists = await prisma.roles.findUnique({
      where: {
        roleId: validatedFields.data.roleId,
      },
    });

    if (!roleExists) {
      return NextResponse.json(
        {
          status: "error",
          message: "Role dengan ID tersebut tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    // Check if username or email is taken by another user
    const userConflict = await prisma.users.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: validatedFields.data.username },
              { email: validatedFields.data.email },
            ],
          },
          {
            userId: { not: validatedFields.data.userId },
          },
        ],
      },
    });

    if (userConflict) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Username atau email tersebut sudah digunakan oleh pengguna lain.",
        },
        { status: 400 }
      );
    }

    // Bcrypt the password
    const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

    // Create the new user
    const updatedUser = await prisma.users.update({
      where: { userId: validatedFields.data.userId },
      data: {
        name: validatedFields.data.name,
        username: validatedFields.data.username,
        email: validatedFields.data.email,
        password: hashedPassword,
        roleId: validatedFields.data.roleId,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Pengguna berhasil diperbarui.",
      data: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal memperbarui pengguna.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

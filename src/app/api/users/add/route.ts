import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import bcrypt from "bcrypt";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  name: z
    .string("Nama harus berupa string.")
    .min(1, "Nama pengguna harus diisi."),
  username: z
    .string("Username harus berupa string.")
    .min(1, "Username harus diisi.")
    .lowercase("Username harus berupa huruf kecil."),
  email: z.string("Email harus berupa string.").min(1, "Email harus diisi."),
  password: z
    .string("Kata sandi harus berupa string.")
    .min(8, "Kata sandi harus terdiri dari minimal 8 karakter."),
  confirmPassword: z
    .string("Konfirmasi kata sandi harus berupa string.")
    .min(8, "Konfirmasi kata sandi harus terdiri dari minimal 8 karakter."),
  roleId: z.number("Role ID harus berupa angka."),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
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

    // check if the username or email exists
    const userExists = await prisma.users.findFirst({
      where: {
        OR: [
          { username: validatedFields.data.username },
          { email: validatedFields.data.email },
        ],
      },
    });

    if (userExists) {
      return NextResponse.json(
        {
          status: "error",
          message: "Pengguna dengan username atau email tersebut sudah ada.",
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

    // Bcrypt the password
    const hashedPassword = await bcrypt.hash(validatedFields.data.password, 10);

    // Create the new user
    const newUser = await prisma.users.create({
      data: {
        name: validatedFields.data.name,
        username: validatedFields.data.username,
        email: validatedFields.data.email,
        password: hashedPassword,
        roleId: Number(validatedFields.data.roleId),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Pengguna berhasil ditambahkan.",
      data: newUser,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal menambahkan pengguna.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

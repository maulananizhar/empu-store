import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const schema = z.object({
  userId: z.number("User ID harus berupa angka."),
  oldPassword: z
    .string("Kata sandi lama harus berupa string.")
    .min(8, "Kata sandi lama harus terdiri dari minimal 8 karakter."),
  newPassword: z
    .string("Kata sandi baru harus berupa string.")
    .min(8, "Kata sandi baru harus terdiri dari minimal 8 karakter."),
  confirmNewPassword: z
    .string("Konfirmasi kata sandi baru harus berupa string.")
    .min(
      8,
      "Konfirmasi kata sandi baru harus terdiri dari minimal 8 karakter."
    ),
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

    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      userId: Number(formData.get("userId")),
      oldPassword: String(formData.get("oldPassword")),
      newPassword: String(formData.get("newPassword")),
      confirmNewPassword: String(formData.get("confirmNewPassword")),
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
      where: { userId: validatedFields.data.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          status: "error",
          message: "User tidak ditemukan",
        },
        { status: 404 }
      );
    }

    // Check if the old password is correct
    const isOldPasswordCorrect = await bcrypt.compare(
      validatedFields.data.oldPassword,
      existingUser.password
    );

    if (!isOldPasswordCorrect) {
      return NextResponse.json(
        {
          status: "error",
          message: "Kata sandi lama salah",
        },
        { status: 400 }
      );
    }

    // Check if the new password and confirm password match
    if (
      validatedFields.data.newPassword !==
      validatedFields.data.confirmNewPassword
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Kata sandi baru dan konfirmasi kata sandi tidak cocok",
        },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(
      validatedFields.data.newPassword,
      10
    );

    // Update the user's password in the database
    await prisma.users.update({
      where: { userId: validatedFields.data.userId },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Kata sandi berhasil diperbarui",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to update category",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

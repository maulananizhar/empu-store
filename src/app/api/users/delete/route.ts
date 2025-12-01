import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  userId: z.number("User ID harus berupa angka."),
});

export async function DELETE(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      userId: Number(formData.get("userId")),
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
          message: "Pengguna tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // Check if the user have related data that prevents deletion
    const relatedOrders = await prisma.orders.findFirst({
      where: { cashierId: Number(validatedFields.data.userId) },
    });

    if (relatedOrders) {
      return NextResponse.json(
        {
          status: "error",
          message: "Pengguna tidak dapat dihapus karena memiliki data terkait.",
        },
        { status: 400 }
      );
    }

    // Delete the user
    await prisma.users.delete({
      where: { userId: validatedFields.data.userId },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Pengguna berhasil dihapus.",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal menghapus pengguna.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  name: z.string().min(1, "Nama kategori harus diisi."),
  icon: z.string().min(1, "Icon kategori harus diisi."),
});

export async function POST(request: Request) {
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
      name: String(formData.get("name")),
      icon: String(formData.get("icon")),
    });

    // Validate the request parameters
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          status: "error",
          error: validatedFields.error.name,
          message: validatedFields.error.issues
            .map(issue => issue.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    // Check if the category name already exists
    const nameExists = await prisma.categories.findUnique({
      where: {
        name: validatedFields.data.name,
      },
    });

    if (nameExists) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nama kategori sudah ada.",
        },
        { status: 400 }
      );
    }

    // Create the category in the database
    const newCategory = await prisma.categories.create({
      data: {
        name: validatedFields.data.name,
        icon: validatedFields.data.icon,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Kategori berhasil ditambahkan.",
      data: newCategory,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal menghapus kategori.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

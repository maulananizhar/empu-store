import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  categoryId: z.number().min(1, "ID kategori tidak valid."),
  name: z.string().min(1, "Nama kategori harus diisi."),
  icon: z.string().min(1, "Icon kategori harus diisi."),
});

export async function PUT(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      categoryId: Number(formData.get("categoryId")),
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
    const nameExists = await prisma.categories.findFirst({
      where: {
        name: validatedFields.data.name,
        NOT: {
          categoryId: validatedFields.data.categoryId,
        },
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

    // Update the category in the database
    const updatedCategory = await prisma.categories.update({
      where: {
        categoryId: validatedFields.data.categoryId,
      },
      data: {
        name: validatedFields.data.name,
        icon: validatedFields.data.icon,
      },
    });

    return NextResponse.json(
      {
        status: "Kategori berhasil diperbarui.",
        data: updatedCategory,
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

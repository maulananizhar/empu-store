import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  categoryId: z.number().min(1, "ID kategori tidak valid."),
});

export async function DELETE(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      categoryId: Number(formData.get("categoryId")),
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

    // Check if the category has associated products
    const productCount = await prisma.products.count({
      where: {
        categoryId: validatedFields.data.categoryId,
      },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Tidak dapat menghapus kategori yang memiliki produk terkait.",
        },
        { status: 400 }
      );
    }

    // Delete the category from the database
    await prisma.categories.delete({
      where: {
        categoryId: validatedFields.data.categoryId,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Kategori berhasil dihapus.",
      },
      { status: 200 }
    );
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

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  productId: z.number().min(1, "ID produk tidak valid."),
  name: z.string().min(1, "Nama produk harus diisi."),
  category: z.string().min(1, "Kategori harus diisi."),
  price: z.number().min(0, "Harga harus berupa angka positif."),
  stok: z.number().min(0, "Stok harus berupa angka positif."),
});

export async function PUT(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      productId: Number(formData.get("productId")),
      name: String(formData.get("name")),
      category: String(formData.get("category")),
      price: Number(formData.get("price")),
      stok: Number(formData.get("stok")),
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

    // Check if the product name already exists
    const nameExists = await prisma.products.findFirst({
      where: {
        name: validatedFields.data.name,
        NOT: {
          productId: validatedFields.data.productId,
        },
      },
    });

    if (nameExists) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nama produk sudah ada.",
        },
        { status: 400 }
      );
    }

    const categoryId = await prisma.categories.findUnique({
      where: {
        name: validatedFields.data.category,
      },
    });

    if (!categoryId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Kategori tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    // Update the category in the database
    const updatedProduct = await prisma.products.update({
      where: {
        productId: validatedFields.data.productId,
      },
      data: {
        name: validatedFields.data.name,
        categoryId: categoryId.categoryId,
        price: validatedFields.data.price,
        stock: validatedFields.data.stok,
      },
    });

    return NextResponse.json(
      {
        status: "success",
        message: "Produk berhasil diubah.",
        data: updatedProduct,
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

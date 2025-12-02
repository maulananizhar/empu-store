import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  name: z
    .string("Nama harus berupa string.")
    .min(1, "Nama produk harus diisi."),
  category: z
    .string("Kategori harus berupa string.")
    .min(1, "Kategori harus diisi."),
  price: z
    .number("Harga harus berupa angka.")
    .min(0, "Harga harus berupa angka positif."),
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
      category: String(formData.get("category")),
      price: Number(formData.get("price")),
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

    // check if the product exists
    const productExists = await prisma.products.findFirst({
      where: {
        name: validatedFields.data.name,
      },
    });
    if (productExists) {
      return NextResponse.json(
        {
          status: "error",
          message: "Produk dengan nama tersebut sudah ada.",
        },
        { status: 400 }
      );
    }

    // Use the category ID from the existing category
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

    // Create the product in the database
    const product = await prisma.products.create({
      data: {
        name: validatedFields.data.name,
        categoryId: categoryId.categoryId,
        price: validatedFields.data.price,
        stock: 0,
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Produk berhasil ditambahkan.",
      data: product,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal menambahkan produk.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

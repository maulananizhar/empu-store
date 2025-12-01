import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";

const prisma = new PrismaClient();

const schema = z.object({
  productId: z.number("Produk ID harus berupa angka"),
  percentage: z
    .number("Persentase harus berupa angka")
    .min(0, "Persentase minimal adalah 0")
    .max(100, "Persentase maksimal adalah 100"),
  expiredAt: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), "Tanggal tidak valid"),
});

export async function POST(request: Request) {
  try {
    // Parse the request body
    const formData = await request.formData();

    // Validate the request fields
    const validatedFields = schema.safeParse({
      productId: Number(formData.get("productId")),
      percentage: Number(formData.get("percentage")),
      expiredAt: String(formData.get("expiredAt")),
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

    // Check if the product exists
    const productExists = await prisma.products.findUnique({
      where: {
        productId: validatedFields.data.productId,
      },
    });

    if (!productExists) {
      return NextResponse.json(
        {
          status: "error",
          message: "Produk tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    // Check if there's already an active discount for the product
    const activeDiscount = await prisma.discounts.findFirst({
      where: {
        productId: validatedFields.data.productId,
        expiredAt: {
          gt: new Date(),
        },
      },
    });

    if (activeDiscount) {
      return NextResponse.json(
        {
          status: "error",
          message: "Sudah ada diskon aktif untuk produk ini.",
        },
        { status: 400 }
      );
    }

    // Check if expiredAt is not in the past
    const now = new Date();
    const expiredDate = new Date(validatedFields.data.expiredAt);

    if (expiredDate < now) {
      return NextResponse.json(
        {
          status: "error",
          message: "Tanggal kedaluwarsa tidak boleh di masa lalu.",
        },
        { status: 400 }
      );
    }

    // Create the discount in the database
    const newDiscount = await prisma.discounts.create({
      data: {
        productId: validatedFields.data.productId,
        percentage: validatedFields.data.percentage,
        expiredAt: new Date(validatedFields.data.expiredAt),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Diskon berhasil ditambahkan.",
      data: newDiscount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Terjadi kesalahan saat memproses permintaan.",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

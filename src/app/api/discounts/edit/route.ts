import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  discountId: z.number("Diskon ID harus berupa angka"),
  productId: z.number("Produk ID harus berupa angka"),
  percentage: z
    .number("Persentase harus berupa angka")
    .min(0, "Persentase minimal adalah 0")
    .max(100, "Persentase maksimal adalah 100"),
  expiredAt: z
    .string()
    .refine(date => !isNaN(Date.parse(date)), "Tanggal tidak valid"),
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
      discountId: Number(formData.get("discountId")),
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

    // 1. Ambil data diskon
    const discount = await prisma.discounts.findUnique({
      where: { discountId: validatedFields.data.discountId },
    });

    if (!discount) {
      return NextResponse.json(
        {
          status: "error",
          message: "Diskon tidak ditemukan.",
        },
        { status: 404 }
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
        AND: {
          discountId: {
            not: validatedFields.data.discountId,
          },
        },
      },
    });

    // Cek apakah produk yang memiliki diskon ini pernah masuk transaksi
    const productOrdered = await prisma.ordersProducts.findFirst({
      where: {
        productId: discount.productId,
        createdAt: {
          gte: discount.createdAt,
          lte: discount.expiredAt,
        },
      },
    });

    const orderDate = await prisma.orders.findFirst({
      where: {
        orderId: productOrdered?.orderId,
      },
    });

    if (
      orderDate?.createdAt
        ? orderDate.createdAt >= discount.createdAt &&
          orderDate.createdAt <= discount.expiredAt
        : false
    ) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Diskon tidak dapat dihapus karena produk yang menggunakan diskon ini pernah dipesan.",
        },
        { status: 400 }
      );
    }

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
    const updatedDiscount = await prisma.discounts.update({
      where: { discountId: validatedFields.data.discountId },
      data: {
        productId: validatedFields.data.productId,
        percentage: validatedFields.data.percentage,
        expiredAt: new Date(validatedFields.data.expiredAt),
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Diskon berhasil diperbarui.",
      data: updatedDiscount,
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

import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import z from "zod";
import { AxiosExtendedResponse } from "@/types/axios";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

const schema = z.object({
  discountId: z.number("Diskon ID harus berupa angka"),
  productId: z.number("Produk ID harus berupa angka"),
});

export async function DELETE(request: Request) {
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

    // 2. Cek apakah produk yang memiliki diskon ini pernah masuk transaksi
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

    // 3. Cek apakah diskon masih aktif (optional)
    if (discount.expiredAt < new Date()) {
      return NextResponse.json(
        {
          status: "error",
          message: `Diskon tidak dapat dihapus karena masih aktif.`,
        },
        { status: 400 }
      );
    }

    // 4. Hapus diskon
    await prisma.discounts.delete({
      where: { discountId: validatedFields.data.discountId },
    });

    return NextResponse.json({
      status: "success",
      message: "Diskon berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal menghapus diskon.",
        error: (error as Error).message,
      } as AxiosExtendedResponse,
      { status: 500 }
    );
  }
}
